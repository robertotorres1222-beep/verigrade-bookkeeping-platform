import express from 'express';
import { performanceMonitor } from '../monitoring/performanceMonitor';
import { errorMonitor } from '../monitoring/errorMonitor';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/monitoring/health
 * Get system health status
 */
router.get('/health', (req, res) => {
  try {
    const health = performanceMonitor.getHealthCheck();
    
    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get health status',
    });
  }
});

/**
 * GET /api/monitoring/performance
 * Get performance metrics
 */
router.get('/performance', requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const stats = performanceMonitor.getPerformanceStats();
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Performance stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get performance statistics',
    });
  }
});

/**
 * GET /api/monitoring/errors
 * Get error metrics
 */
router.get('/errors', requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const stats = errorMonitor.getErrorStats();
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get error statistics',
    });
  }
});

/**
 * GET /api/monitoring/alerts
 * Get active alerts
 */
router.get('/alerts', requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const alerts = errorMonitor.getActiveAlerts();
    
    res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get alerts',
    });
  }
});

/**
 * POST /api/monitoring/alerts/:ruleId/resolve
 * Resolve an alert
 */
router.post('/alerts/:ruleId/resolve', requireRole(['ADMIN']), (req, res) => {
  try {
    const { ruleId } = req.params;
    errorMonitor.resolveAlert(ruleId);
    
    res.json({
      success: true,
      message: 'Alert resolved successfully',
    });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve alert',
    });
  }
});

/**
 * GET /api/monitoring/metrics
 * Get all monitoring metrics
 */
router.get('/metrics', requireRole(['ADMIN']), (req, res) => {
  try {
    const performanceStats = performanceMonitor.getPerformanceStats();
    const errorStats = errorMonitor.getErrorStats();
    const health = performanceMonitor.getHealthCheck();
    const alerts = errorMonitor.getActiveAlerts();
    
    res.json({
      success: true,
      data: {
        health,
        performance: performanceStats,
        errors: errorStats,
        alerts,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get metrics',
    });
  }
});

/**
 * POST /api/monitoring/cleanup
 * Clean up old monitoring data
 */
router.post('/cleanup', requireRole(['ADMIN']), (req, res) => {
  try {
    performanceMonitor.clearOldMetrics();
    errorMonitor.clearOldErrors();
    
    res.json({
      success: true,
      message: 'Monitoring data cleaned up successfully',
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clean up monitoring data',
    });
  }
});

export default router;


