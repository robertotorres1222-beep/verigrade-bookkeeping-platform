import { Router } from 'express';
import { NLPQueryController } from '../controllers/nlpQueryController';

const router = Router();
const nlpQueryController = new NLPQueryController();

// Process natural language query
router.post('/organizations/:organizationId/users/:userId/queries', (req, res) => {
  nlpQueryController.processQuery(req, res);
});

// Get query history
router.get('/organizations/:organizationId/users/:userId/queries/history', (req, res) => {
  nlpQueryController.getQueryHistory(req, res);
});

// Get query suggestions
router.get('/organizations/:organizationId/users/:userId/queries/suggestions', (req, res) => {
  nlpQueryController.getQuerySuggestions(req, res);
});

// Save query to favorites
router.post('/organizations/:organizationId/users/:userId/queries/favorites', (req, res) => {
  nlpQueryController.saveQueryToFavorites(req, res);
});

// Get favorite queries
router.get('/organizations/:organizationId/users/:userId/queries/favorites', (req, res) => {
  nlpQueryController.getFavoriteQueries(req, res);
});

// Delete favorite query
router.delete('/organizations/:organizationId/users/:userId/queries/favorites/:favoriteId', (req, res) => {
  nlpQueryController.deleteFavoriteQuery(req, res);
});

// Export query results
router.post('/organizations/:organizationId/users/:userId/queries/export', (req, res) => {
  nlpQueryController.exportQueryResults(req, res);
});

export default router;

