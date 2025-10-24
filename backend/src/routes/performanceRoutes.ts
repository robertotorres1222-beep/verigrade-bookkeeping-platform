import { Router } from 'express';
import { performanceController } from '../controllers/performanceController';

const router = Router();

// Database optimization
router.post('/database/optimize', performanceController.optimizeDatabase);

// Query optimization
router.post('/queries/optimize', performanceController.optimizeQueries);

// Cache optimization
router.post('/cache/optimize', performanceController.optimizeCache);

// Frontend optimization
router.post('/frontend/optimize', performanceController.optimizeFrontend);

// API optimization
router.post('/api/optimize', performanceController.optimizeAPI);

export default router;