import { Router } from 'express';
import { body } from 'express-validator';
import { CompanyController } from '../controllers/company.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../entities/User';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();
const companyController = new CompanyController();

/**
 * @swagger
 * /api/companies:
 *   post:
 *     tags: [Companies]
 *     summary: Create a new company
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - taxInfo
 *             properties:
 *               name:
 *                 type: string
 *               taxInfo:
 *                 type: object
 *                 properties:
 *                   taxNumber:
 *                     type: string
 *                   taxOffice:
 *                     type: string
 *     responses:
 *       201:
 *         description: Company created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    body('name').notEmpty(),
    body('taxInfo.taxNumber').notEmpty(),
    body('taxInfo.taxOffice').notEmpty(),
    validateRequest
  ],
  companyController.create
);

/**
 * @swagger
 * /api/companies:
 *   get:
 *     tags: [Companies]
 *     summary: Get all companies
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of companies
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', 
  authenticate, 
  authorize(UserRole.ADMIN),
  companyController.getAll
);

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     tags: [Companies]
 *     summary: Get company by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Company not found
 */
router.get('/:id', 
  authenticate,
  companyController.getById
);

/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     tags: [Companies]
 *     summary: Update company
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               taxInfo:
 *                 type: object
 *     responses:
 *       200:
 *         description: Company updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Company not found
 */
router.put('/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COMPANY_ADMIN),
  companyController.update
);

export default router;