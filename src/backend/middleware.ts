import { Request, Response, NextFunction } from 'express';
import { Role } from './workflow';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: Role;
    username: string;
  };
}

/**
 * Express middleware to enforce Role-Based Access Control (RBAC).
 * Verifies that the authenticated user possesses one of the authorized roles.
 */
export const authorizeRoles = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        error: 'Unauthorized: Authentication context is missing.'
      });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        error: `Forbidden: Access denied. Required role(s): [${allowedRoles.join(', ')}]. Current role: '${user.role}'` 
      });
      return;
    }

    next();
  };
};
