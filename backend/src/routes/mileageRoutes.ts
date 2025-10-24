import { Router } from 'express';
import { 
  createTrip, 
  getTrips, 
  getTrip, 
  updateTrip, 
  deleteTrip, 
  getMileageSummary, 
  generateMileageReport, 
  getActiveTrip, 
  updateActiveTripLocation 
} from '../controllers/mileageController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Trip management routes
router.post('/trips', createTrip);
router.get('/trips', getTrips);
router.get('/trips/active', getActiveTrip);
router.get('/trips/:id', getTrip);
router.put('/trips/:id', updateTrip);
router.delete('/trips/:id', deleteTrip);

// Location tracking for active trips
router.post('/trips/active/location', updateActiveTripLocation);

// Summary and reporting routes
router.get('/summary', getMileageSummary);
router.get('/reports', generateMileageReport);

export default router;

