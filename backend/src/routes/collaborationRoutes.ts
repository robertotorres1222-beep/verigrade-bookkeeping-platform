import { Router } from 'express';
import { collaborationController } from '../controllers/collaborationController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Collaboration routes
router.post('/organizations/:organizationId/transactions/:transactionId/notes', authenticate, collaborationController.addTransactionNote);
router.get('/organizations/:organizationId/transactions/:transactionId/notes', authenticate, collaborationController.getTransactionNotes);
router.post('/organizations/:organizationId/documents/:documentId/annotations', authenticate, collaborationController.addDocumentAnnotation);
router.get('/organizations/:organizationId/documents/:documentId/annotations', authenticate, collaborationController.getDocumentAnnotations);
router.put('/organizations/:organizationId/transactions/:transactionId/review-status', authenticate, collaborationController.updateReviewStatus);
router.get('/organizations/:organizationId/transactions/:transactionId/review-status', authenticate, collaborationController.getReviewStatus);
router.post('/organizations/:organizationId/mention', authenticate, collaborationController.mentionTeamMember);
router.get('/organizations/:organizationId/collaboration-activity', authenticate, collaborationController.getCollaborationActivity);

export default router;

