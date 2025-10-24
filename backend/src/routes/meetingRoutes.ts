import { Router } from 'express';
import { meetingController } from '../controllers/meetingController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Meeting routes
router.post('/meetings', authenticate, meetingController.createMeeting);
router.get('/meetings', authenticate, meetingController.getMeetings);
router.put('/meetings/:meetingId', authenticate, meetingController.updateMeeting);
router.put('/meetings/:meetingId/cancel', authenticate, meetingController.cancelMeeting);
router.post('/meetings/:meetingId/notes', authenticate, meetingController.addMeetingNotes);
router.get('/meetings/:meetingId/notes', authenticate, meetingController.getMeetingNotes);
router.get('/meetings/statistics', authenticate, meetingController.getMeetingStatistics);

export default router;

