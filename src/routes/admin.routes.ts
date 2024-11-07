import { Router } from 'express';
import { body } from 'express-validator';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../entities/User';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();
const adminController = new AdminController();

router.get('/companies',
  authenticate,
  authorize(UserRole.ADMIN),
  adminController.getAllCompanies
);

router.put('/companies/:id/status',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    body('status').isBoolean(),
    validateRequest
  ],
  adminController.updateCompanyStatus
);

router.get('/documents',
  authenticate,
  authorize(UserRole.ADMIN),
  adminController.getPendingDocuments
);

router.put('/documents/:id/status',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    body('status').isIn(['approved', 'rejected']),
    validateRequest
  ],
  adminController.updateDocumentStatus
);

router.get('/dpcs',
  authenticate,
  authorize(UserRole.ADMIN),
  adminController.getPendingDPCs
);

router.put('/dpcs/:id/status',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    body('status').isIn(['approved', 'rejected']),
    validateRequest
  ],
  adminController.updateDPCStatus
);

export default router;