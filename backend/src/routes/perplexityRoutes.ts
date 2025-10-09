import express from 'express';
import { perplexityService } from '../services/perplexityService';

const router = express.Router();

// Initialize Perplexity service
router.get('/health', async (req, res) => {
  try {
    const isInitialized = await perplexityService.initialize();
    res.json({
      success: true,
      data: {
        initialized: isInitialized,
        available: true,
        message: isInitialized ? 'Perplexity MCP Service is ready' : 'Perplexity MCP Service needs API key'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check Perplexity service health'
    });
  }
});

// Search endpoint
router.post('/search', async (req, res) => {
  try {
    const { query, forceModel } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    const result = await perplexityService.search(query, forceModel);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Search request failed'
    });
  }
});

// Reasoning endpoint
router.post('/reason', async (req, res) => {
  try {
    const { query, forceModel } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    const result = await perplexityService.reason(query, forceModel);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Reasoning request failed'
    });
  }
});

// Deep research endpoint
router.post('/deep-research', async (req, res) => {
  try {
    const { query, focusAreas, forceModel } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    const result = await perplexityService.deepResearch(query, focusAreas, forceModel);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Deep research request failed'
    });
  }
});

// Business-specific endpoints
router.post('/research-accounting', async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required'
      });
    }

    const result = await perplexityService.researchAccountingBestPractices(topic);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Accounting research request failed'
    });
  }
});

router.post('/analyze-trends', async (req, res) => {
  try {
    const { industry } = req.body;
    
    if (!industry) {
      return res.status(400).json({
        success: false,
        message: 'Industry is required'
      });
    }

    const result = await perplexityService.analyzeBusinessTrends(industry);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Trend analysis request failed'
    });
  }
});

router.post('/research-tax-regulations', async (req, res) => {
  try {
    const { country } = req.body;
    
    if (!country) {
      return res.status(400).json({
        success: false,
        message: 'Country is required'
      });
    }

    const result = await perplexityService.deepResearchTaxRegulations(country);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Tax regulations research request failed'
    });
  }
});

router.post('/competitor-analysis', async (req, res) => {
  try {
    const { competitorName } = req.body;
    
    if (!competitorName) {
      return res.status(400).json({
        success: false,
        message: 'Competitor name is required'
      });
    }

    const result = await perplexityService.getCompetitorAnalysis(competitorName);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Competitor analysis request failed'
    });
  }
});

router.post('/research-integration', async (req, res) => {
  try {
    const { platform } = req.body;
    
    if (!platform) {
      return res.status(400).json({
        success: false,
        message: 'Platform is required'
      });
    }

    const result = await perplexityService.researchIntegrationOptions(platform);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Integration research request failed'
    });
  }
});

export default router;
