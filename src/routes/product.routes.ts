import { Router } from 'express';
import { body } from 'express-validator';
import { ProductController } from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../entities/User';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();
const productController = new ProductController();

router.post('/',
  authenticate,
  authorize(UserRole.COMPANY_ADMIN, UserRole.USER),
  [
    body('name').notEmpty(),
    body('details').isObject(),
    validateRequest
  ],
  productController.create
);

router.get('/',
  authenticate,
  productController.getAll
);

router.get('/:id',
  authenticate,
  productController.getById
);

router.put('/:id',
  authenticate,
  authorize(UserRole.COMPANY_ADMIN, UserRole.USER),
  productController.update
);

router.delete('/:id',
  authenticate,
  authorize(UserRole.COMPANY_ADMIN),
  productController.delete
);

export default router;