import Bull, { Job } from 'bull';
import IORedis from 'ioredis';
import { categorizeTransaction, CategorizationRequest } from '../services/aiCategorizerService';
import { prisma } from '../config/database';

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.error('REDIS_URL is required to run categorizer worker');
  process.exit(1);
}

const connection = new IORedis(redisUrl);

// Create the queue
export const categorizerQueue = new Bull('categorize-transactions', redisUrl, {
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Process jobs
categorizerQueue.process(5, async (job: Job<CategorizationRequest & { transactionId: string }>) => {
  const { transactionId, amount, description, metadata, merchant, date } = job.data;
  
  console.log(`Processing categorization job ${job.id} for transaction ${transactionId}`);
  
  try {
    // Categorize the transaction
    const result = await categorizeTransaction({
      amount,
      description,
      metadata,
      merchant,
      date
    });
    
    // Update the transaction in the database
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { 
        category: result.category,
        // Store additional metadata
        metadata: {
          ...metadata,
          aiCategorization: {
            category: result.category,
            confidence: result.confidence,
            reasoning: result.reasoning,
            timestamp: new Date().toISOString()
          }
        }
      },
    });
    
    console.log(`Successfully categorized transaction ${transactionId} as ${result.category} (confidence: ${result.confidence})`);
    
    return {
      success: true,
      transactionId,
      category: result.category,
      confidence: result.confidence,
      reasoning: result.reasoning
    };
  } catch (error) {
    console.error(`Error categorizing transaction ${transactionId}:`, error);
    throw error;
  }
});

// Event handlers
categorizerQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

categorizerQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err?.message);
});

categorizerQueue.on('stalled', (job) => {
  console.warn(`Job ${job.id} stalled`);
});

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down categorizer worker...');
  await categorizerQueue.close();
  await connection.quit();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Health check endpoint (optional)
if (require.main === module) {
  const express = require('express');
  const app = express();
  
  app.get('/health', async (req: any, res: any) => {
    try {
      const queueStats = await categorizerQueue.getJobCounts();
      res.json({ 
        ok: true, 
        queue: queueStats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        ok: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  const port = process.env.WORKER_PORT || 4000;
  app.listen(port, () => {
    console.log(`Categorizer worker health check listening on port ${port}`);
  });
}

export default categorizerQueue;
