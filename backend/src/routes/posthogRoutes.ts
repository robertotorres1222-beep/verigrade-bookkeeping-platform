import express from 'express';
import GitHubService from '../services/githubService';

const router = express.Router();
const githubService = new GitHubService();

// PostHog webhook endpoint
router.post('/webhook', async (req, res) => {
  try {
    console.log('📊 PostHog webhook received:', req.body);

    const event = req.body;
    
    // Validate the event structure
    if (!event.event || !event.timestamp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PostHog event structure'
      });
    }

    // Create GitHub issue if the event qualifies
    await githubService.createIssueFromPostHogEvent(event);

    // Also log the event for debugging
    console.log(`📈 PostHog event processed: ${event.event}`, {
      timestamp: event.timestamp,
      user: event.distinct_id,
      properties: event.properties
    });

    res.json({
      success: true,
      message: 'PostHog event processed successfully',
      event: event.event,
      timestamp: event.timestamp
    });

  } catch (error) {
    console.error('❌ Error processing PostHog webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process PostHog event',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test endpoint to manually trigger GitHub issue creation
router.post('/test-github-issue', async (req, res) => {
  try {
    const testEvent = {
      event: 'mcp_analysis_error',
      timestamp: new Date().toISOString(),
      distinct_id: 'test-user',
      properties: {
        error: 'Test error for GitHub integration',
        source: 'test-trigger',
        analysis_type: 'test-analysis',
        confidence: 0.95,
        mode: 'test-mode'
      }
    };

    await githubService.createIssueFromPostHogEvent(testEvent);

    res.json({
      success: true,
      message: 'Test GitHub issue creation triggered',
      event: testEvent
    });

  } catch (error) {
    console.error('❌ Error creating test GitHub issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test GitHub issue',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check for PostHog integration
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'PostHog integration is healthy',
    timestamp: new Date().toISOString(),
    github: {
      configured: !!process.env.GITHUB_TOKEN,
      owner: process.env.GITHUB_OWNER || 'robertotorres',
      repo: process.env.GITHUB_REPO || 'verigrade-bookkeeping-platform'
    }
  });
});

export default router;






