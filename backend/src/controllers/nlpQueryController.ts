import { Request, Response } from 'express';
import { NLPQueryService } from '../services/nlpQueryService';

export class NLPQueryController {
  async processQuery(req: Request, res: Response) {
    try {
      const { organizationId, userId } = req.params;
      const { query } = req.body;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Query is required and must be a string'
        });
      }

      const nlpService = new NLPQueryService(organizationId, userId);
      const result = await nlpService.processQuery(query);

      res.json({
        success: true,
        data: {
          query,
          result,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Error processing NLP query:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process query',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getQueryHistory(req: Request, res: Response) {
    try {
      const { organizationId, userId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const nlpService = new NLPQueryService(organizationId, userId);
      const history = await nlpService.getQueryHistory();

      // Apply pagination
      const paginatedHistory = history.slice(
        Number(offset), 
        Number(offset) + Number(limit)
      );

      res.json({
        success: true,
        data: {
          queries: paginatedHistory,
          total: history.length,
          pagination: {
            limit: Number(limit),
            offset: Number(offset),
            hasMore: Number(offset) + Number(limit) < history.length
          }
        }
      });
    } catch (error) {
      console.error('Error getting query history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get query history',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getQuerySuggestions(req: Request, res: Response) {
    try {
      const { organizationId, userId } = req.params;

      const nlpService = new NLPQueryService(organizationId, userId);
      const suggestions = await nlpService.getQuerySuggestions();

      res.json({
        success: true,
        data: {
          suggestions
        }
      });
    } catch (error) {
      console.error('Error getting query suggestions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get query suggestions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async saveQueryToFavorites(req: Request, res: Response) {
    try {
      const { organizationId, userId } = req.params;
      const { query, title, description } = req.body;

      if (!query || !title) {
        return res.status(400).json({
          success: false,
          message: 'Query and title are required'
        });
      }

      // In a real implementation, you would save this to a database
      res.json({
        success: true,
        message: 'Query saved to favorites',
        data: {
          id: `fav_${Date.now()}`,
          query,
          title,
          description,
          userId,
          organizationId,
          createdAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error saving query to favorites:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save query to favorites',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getFavoriteQueries(req: Request, res: Response) {
    try {
      const { organizationId, userId } = req.params;

      // In a real implementation, you would fetch from database
      const favorites = [
        {
          id: 'fav_1',
          query: 'Show me revenue for this month',
          title: 'Monthly Revenue',
          description: 'Quick view of current month revenue',
          createdAt: new Date()
        },
        {
          id: 'fav_2',
          query: 'What are my top expenses?',
          title: 'Top Expenses',
          description: 'Highest expense categories',
          createdAt: new Date()
        }
      ];

      res.json({
        success: true,
        data: {
          favorites
        }
      });
    } catch (error) {
      console.error('Error getting favorite queries:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get favorite queries',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteFavoriteQuery(req: Request, res: Response) {
    try {
      const { organizationId, userId, favoriteId } = req.params;

      // In a real implementation, you would delete from database
      res.json({
        success: true,
        message: 'Favorite query deleted',
        data: {
          favoriteId,
          deletedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error deleting favorite query:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete favorite query',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async exportQueryResults(req: Request, res: Response) {
    try {
      const { organizationId, userId } = req.params;
      const { query, format = 'csv' } = req.body;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Query is required for export'
        });
      }

      const nlpService = new NLPQueryService(organizationId, userId);
      const result = await nlpService.processQuery(query);

      // Generate export data based on format
      let exportData: string;
      let contentType: string;
      let filename: string;

      if (format === 'csv') {
        exportData = this.generateCSV(result);
        contentType = 'text/csv';
        filename = `query_results_${Date.now()}.csv`;
      } else if (format === 'json') {
        exportData = JSON.stringify(result, null, 2);
        contentType = 'application/json';
        filename = `query_results_${Date.now()}.json`;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Unsupported export format'
        });
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(exportData);
    } catch (error) {
      console.error('Error exporting query results:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export query results',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private generateCSV(result: any): string {
    if (result.type === 'table' && Array.isArray(result.data)) {
      if (result.data.length === 0) {
        return 'No data available';
      }

      const headers = Object.keys(result.data[0]);
      const csvRows = [headers.join(',')];

      for (const row of result.data) {
        const values = headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        });
        csvRows.push(values.join(','));
      }

      return csvRows.join('\n');
    }

    // For non-table results, create a simple CSV
    return `Type,Value\n"${result.type}","${JSON.stringify(result.data)}"`;
  }
}

