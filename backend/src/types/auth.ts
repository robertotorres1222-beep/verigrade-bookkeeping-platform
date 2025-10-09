import { Request } from 'express';
import { AuthenticatedUser } from '../middleware/auth';

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
