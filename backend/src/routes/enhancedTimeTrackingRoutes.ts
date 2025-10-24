import { Router } from 'express';
import { enhancedTimeTrackingController } from '../controllers/enhancedTimeTrackingController';

const router = Router();

// Project Management Routes
router.post('/projects', enhancedTimeTrackingController.createProject);
router.get('/projects', enhancedTimeTrackingController.getProjects);
router.put('/projects/:id', enhancedTimeTrackingController.updateProject);

// Task Management Routes
router.post('/tasks', enhancedTimeTrackingController.createTask);
router.get('/projects/:projectId/tasks', enhancedTimeTrackingController.getTasks);
router.put('/tasks/:id', enhancedTimeTrackingController.updateTask);

// Time Entry Management Routes
router.post('/time-entries/start', enhancedTimeTrackingController.startTimeEntry);
router.post('/time-entries/:id/stop', enhancedTimeTrackingController.stopTimeEntry);
router.post('/time-entries/:id/pause', enhancedTimeTrackingController.pauseTimeEntry);
router.post('/time-entries/:id/resume', enhancedTimeTrackingController.resumeTimeEntry);
router.get('/time-entries', enhancedTimeTrackingController.getTimeEntries);

// Timesheet Management Routes
router.post('/timesheets', enhancedTimeTrackingController.createTimesheet);
router.get('/timesheets/:userId', enhancedTimeTrackingController.getTimesheets);
router.post('/timesheets/:id/submit', enhancedTimeTrackingController.submitTimesheet);
router.post('/timesheets/:id/approve', enhancedTimeTrackingController.approveTimesheet);

// Resource Management Routes
router.post('/resources', enhancedTimeTrackingController.createResource);
router.get('/resources', enhancedTimeTrackingController.getResources);
router.put('/resources/:id', enhancedTimeTrackingController.updateResource);

// Project Costing Routes
router.get('/projects/:projectId/costing', enhancedTimeTrackingController.getProjectCosting);

// Idle Detection Routes
router.post('/idle-detection', enhancedTimeTrackingController.createIdleDetection);
router.post('/idle-detection/:id/resolve', enhancedTimeTrackingController.resolveIdleDetection);

// GPS Tracking Routes
router.post('/gps-tracking', enhancedTimeTrackingController.createGPSTracking);
router.get('/time-entries/:timeEntryId/gps-tracking', enhancedTimeTrackingController.getGPSTracking);

// Analytics and Reporting Routes
router.get('/analytics', enhancedTimeTrackingController.getTimeTrackingAnalytics);

export default router;



