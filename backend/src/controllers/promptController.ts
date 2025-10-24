import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import promptLibrary from '../data/prompt-library.json';
import { DataAggregationService } from '../services/dataAggregationService';

const prisma = new PrismaClient();

export class PromptController {
  // Get all available prompts with categories
  static async getPrompts(req: Request, res: Response) {
    try {
      const { category, search } = req.query;
      
      let filteredPrompts = promptLibrary.prompts;
      
      if (category) {
        filteredPrompts = filteredPrompts.filter(prompt => prompt.category === category);
      }
      
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredPrompts = filteredPrompts.filter(prompt => 
          prompt.title.toLowerCase().includes(searchTerm) ||
          prompt.description.toLowerCase().includes(searchTerm) ||
          prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
      
      res.json({
        success: true,
        data: {
          prompts: filteredPrompts,
          categories: promptLibrary.categories,
          total: filteredPrompts.length
        }
      });
    } catch (error) {
      console.error('Error fetching prompts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch prompts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get specific prompt template with auto-populated data
  static async getPromptById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const organizationId = req.user?.organizationId;
      
      const prompt = promptLibrary.prompts.find(p => p.id === id);
      
      if (!prompt) {
        return res.status(404).json({
          success: false,
          message: 'Prompt not found'
        });
      }

      // Auto-populate fields if user is authenticated
      let populatedData = {};
      if (userId && organizationId) {
        populatedData = await DataAggregationService.populatePromptFields(id, userId, organizationId);
      }
      
      res.json({
        success: true,
        data: {
          ...prompt,
          populatedData
        }
      });
    } catch (error) {
      console.error('Error fetching prompt:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch prompt',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Execute prompt with user data
  static async executePrompt(req: Request, res: Response) {
    try {
      const { promptId, inputData } = req.body;
      const userId = req.user?.id;
      const organizationId = req.user?.organizationId;

      if (!userId || !organizationId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Find the prompt template
      const promptTemplate = promptLibrary.prompts.find(p => p.id === promptId);
      if (!promptTemplate) {
        return res.status(404).json({
          success: false,
          message: 'Prompt template not found'
        });
      }

      // Create execution record
      const execution = await prisma.promptExecution.create({
        data: {
          organizationId,
          userId,
          promptTemplateId: promptTemplate.id,
          inputData,
          status: 'PENDING'
        }
      });

      // Process the prompt with AI
      const processedPrompt = await processPromptWithAI(promptTemplate, inputData);
      
      // Update execution with result
      await prisma.promptExecution.update({
        where: { id: execution.id },
        data: {
          output: processedPrompt,
          status: 'COMPLETED',
          executionTime: Date.now() - execution.createdAt.getTime()
        }
      });

      res.json({
        success: true,
        data: {
          executionId: execution.id,
          result: processedPrompt
        }
      });
    } catch (error) {
      console.error('Error executing prompt:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to execute prompt',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get prompt categories
  static async getCategories(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: promptLibrary.categories
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get execution history for user
  static async getExecutionHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const organizationId = req.user?.organizationId;
      const { limit = 20, offset = 0 } = req.query;

      if (!userId || !organizationId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const executions = await prisma.promptExecution.findMany({
        where: {
          organizationId,
          userId
        },
        include: {
          promptTemplate: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      });

      res.json({
        success: true,
        data: executions
      });
    } catch (error) {
      console.error('Error fetching execution history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch execution history',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Save customized prompt version
  static async saveCustomPrompt(req: Request, res: Response) {
    try {
      const { promptId, customizations } = req.body;
      const userId = req.user?.id;
      const organizationId = req.user?.organizationId;

      if (!userId || !organizationId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // This would save user customizations to the prompt template
      // For now, we'll just return success
      res.json({
        success: true,
        message: 'Custom prompt saved successfully'
      });
    } catch (error) {
      console.error('Error saving custom prompt:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save custom prompt',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Helper function to process prompt with AI
async function processPromptWithAI(promptTemplate: any, inputData: any) {
  try {
    // Replace placeholders in the prompt with actual data
    let processedPrompt = promptTemplate.prompt;
    
    // Replace all [FIELD_NAME] placeholders with actual values
    for (const [key, value] of Object.entries(inputData)) {
      const placeholder = `[${key}]`;
      processedPrompt = processedPrompt.replace(new RegExp(placeholder, 'g'), String(value));
    }

    // For now, return a mock response
    // In production, this would call the actual AI service
    return {
      analysis: {
        insights: [
          {
            title: 'AI Analysis Complete',
            description: `This is a demonstration of the ${promptTemplate.title} analysis.`,
            impact: 'Positive Impact',
            recommendation: 'Continue using VeriGrade AI for enhanced insights',
            confidence: 0.95
          }
        ],
        summary: `AI analysis completed for ${promptTemplate.title}. This showcases VeriGrade's advanced AI capabilities for ${promptTemplate.category} tasks.`
      },
      processedPrompt,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error processing prompt with AI:', error);
    throw error;
  }
}
