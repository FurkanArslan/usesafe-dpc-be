import { Router } from 'express';
import { body } from 'express-validator';
import { DPCController } from '../controllers/dpc.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../entities/User';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();
const dpcController = new DPCController();

router.post('/',
  authenticate,
  authorize(UserRole.COMPANY_ADMIN, UserRole.USER),
  [
    body('productId').isUUID(),
    body('certificationDetails').isObject(),
    validateRequest
  ],
  dpcController.create
);

router.get('/',
  authenticate,
  dpcController.getAll
);

router.get('/:id',
  authenticate,
  dpcController.getById
);

export default router;