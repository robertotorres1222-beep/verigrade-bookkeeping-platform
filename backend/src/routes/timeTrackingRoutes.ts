import { Router } from 'express';
import { timeTrackingController } from '../controllers/timeTrackingController';

const router = Router();

// Timer Management
router.post('/timer/start', timeTrackingController.startTimer);
router.post('/timer/:timerId/stop', timeTrackingController.stopTimer);
router.post('/timer/:timerId/pause', timeTrackingController.pauseTimer);
router.post('/timer/:timerId/resume', timeTrackingController.resumeTimer);

// Time Entries
router.post('/time-entries', timeTrackingController.createTimeEntry);
router.get('/time-entries', timeTrackingController.getTimeEntries);
router.put('/time-entries/:id', timeTrackingController.updateTimeEntry);
router.delete('/time-entries/:id', timeTrackingController.deleteTimeEntry);

// Project Management
router.post('/projects', timeTrackingController.createProject);
router.get('/projects', timeTrackingController.getProjects);
router.put('/projects/:id', timeTrackingController.updateProject);

// Timesheet Management
router.get('/timesheet', timeTrackingController.getTimesheet);
router.post('/timesheet/:timesheetId/submit', timeTrackingController.submitTimesheet);
router.post('/timesheet/:timesheetId/approve', timeTrackingController.approveTimesheet);

// Project Analytics
router.get('/projects/:projectId/analytics', timeTrackingController.getProjectAnalytics);

export default router;