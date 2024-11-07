import { Router } from 'express';
import { body } from 'express-validator';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../entities/User';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();
const userController = new UserController();

router.post('/',
  authenticate,
  authorize(UserRole.COMPANY_ADMIN),
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn([UserRole.USER]),
    validateRequest
  ],
  userController.create
);

router.get('/',
  authenticate,
  authorize(UserRole.COMPANY_ADMIN, UserRole.ADMIN),
  userController.getCompanyUsers
);

router.delete('/:id',
  authenticate,
  authorize(UserRole.COMPANY_ADMIN, UserRole.ADMIN),
  userController.delete
);

export default router;