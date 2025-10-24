import { Router } from 'express';
import { documentationController } from '../controllers/documentationController';

const router = Router();

// Swagger API Docs
router.get('/swagger', documentationController.getSwaggerDocs);
router.post('/swagger/update', documentationController.updateSwaggerDocs);

// User Guides
router.get('/guides', documentationController.getUserGuides);
router.get('/guides/:id', documentationController.getUserGuide);
router.post('/guides', documentationController.createUserGuide);

// Video Tutorials
router.get('/tutorials', documentationController.getVideoTutorials);
router.get('/tutorials/:id', documentationController.getVideoTutorial);
router.post('/tutorials', documentationController.createVideoTutorial);

// Architecture Diagrams
router.get('/diagrams', documentationController.getArchitectureDiagrams);
router.get('/diagrams/:id', documentationController.getArchitectureDiagram);
router.post('/diagrams', documentationController.createArchitectureDiagram);

// Runbooks
router.get('/runbooks', documentationController.getRunbooks);
router.get('/runbooks/:id', documentationController.getRunbook);
router.post('/runbooks', documentationController.createRunbook);

export default router;



