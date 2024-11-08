import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { manufacturerRegistrationValidation } from '../validations/manufacturerRegistration.validation';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new manufacturer company
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - taxInfo
 *               - authorizedPerson
 *               - password
 *             properties:
 *               companyName:
 *                 type: string
 *                 description: Official company name
 *               taxInfo:
 *                 type: object
 *                 properties:
 *                   taxNumber:
 *                     type: string
 *                     description: 10-digit tax identification number
 *                   tradeRegistryNo:
 *                     type: string
 *                   mersisNo:
 *                     type: string
 *               authorizedPerson:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   identificationNumber:
 *                     type: string
 *                     description: 11-digit identification number
 *                   email:
 *                     type: string
 *                     format: email
 *                   phoneNumber:
 *                     type: string
 *                   countryCode:
 *                     type: string
 *               addresses:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [headquarters, branch, factory, warehouse]
 *                     street:
 *                       type: string
 *                     city:
 *                       type: string
 *                     district:
 *                       type: string
 *                     postalCode:
 *                       type: string
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     filePath:
 *                       type: string
 *     responses:
 *       201:
 *         description: Registration initiated successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/register', 
  manufacturerRegistrationValidation,
  validateRequest,
  authController.register
);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     tags: [Authentication]
 *     summary: Verify email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email successfully verified
 *       400:
 *         description: Invalid verification token
 */
router.post('/verify-email', 
  [
    body('token').notEmpty().withMessage('Verification token is required')
  ],
  validateRequest,
  authController.verifyEmail
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validateRequest
  ],
  authController.login
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Request password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset link sent to your email
 *       400:
 *         description: Invalid email format
 */
router.post('/forgot-password',
  [
    body('email').isEmail().normalizeEmail(),
    validateRequest
  ],
  authController.forgotPassword
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Reset password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password successfully reset
 *       400:
 *         description: Invalid reset token or password format
 */
router.post('/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
      .matches(/\d/).withMessage('Password must contain at least one number'),
    validateRequest
  ],
  authController.resetPassword
);

export default router;