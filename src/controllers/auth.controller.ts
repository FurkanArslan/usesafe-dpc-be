import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AppDataSource } from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../entities/User';
import { Company } from '../entities/Company';
import { CompanyDocument, DocumentStatus } from '../entities/CompanyDocument';
import { CompanyAddress } from '../entities/CompanyAddress';
import { config } from '../config';
import { logger } from '../utils/logger';
import { generateVerificationToken, verifyEmailToken } from '../utils/tokenUtils';
import { ManufacturerRegistrationInput, AddressInput, DocumentInput } from '../types/registration';

export class AuthController {
  async register(req: Request, res: Response) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { 
        companyName, 
        taxInfo, 
        authorizedPerson,
        addresses = [],
        documents = []
      }: ManufacturerRegistrationInput = req.body;

      const userRepository = AppDataSource.getRepository(User);
      const companyRepository = AppDataSource.getRepository(Company);
      const documentRepository = AppDataSource.getRepository(CompanyDocument);
      const addressRepository = AppDataSource.getRepository(CompanyAddress);

      // Email check
      const existingUser = await userRepository.findOne({ 
        where: { 
          email: authorizedPerson.email 
        } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'This email address is already registered' });
      }

      // Create company
      const company = companyRepository.create({
        name: companyName,
        taxInfo: {
          taxNumber: taxInfo.taxNumber,
          tradeRegistryNo: taxInfo.tradeRegistryNo,
          mersisNo: taxInfo.mersisNo
        },
        status: false // Pending admin approval
      });
      await companyRepository.save(company);

      // Create user
      const user = userRepository.create({
        email: authorizedPerson.email,
        passwordHash: await bcrypt.hash(req.body.password, 10),
        role: UserRole.COMPANY_ADMIN,
        company,
        personalInfo: {
          firstName: authorizedPerson.firstName,
          lastName: authorizedPerson.lastName,
          identificationNumber: authorizedPerson.identificationNumber,
          phoneNumber: authorizedPerson.phoneNumber,
          countryCode: authorizedPerson.countryCode
        },
        status: false // Pending email verification
      });
      await userRepository.save(user);

      // Save addresses
      const companyAddresses = addresses.map((addr: AddressInput) => addressRepository.create({
        company,
        type: addr.type,
        street: addr.street,
        city: addr.city,
        district: addr.district,
        postalCode: addr.postalCode
      }));
      await addressRepository.save(companyAddresses);

      // Save documents
      const companyDocuments = documents.map((doc: DocumentInput) => documentRepository.create({
        company,
        type: doc.type,
        filePath: doc.filePath,
        status: DocumentStatus.PENDING
      }));
      await documentRepository.save(companyDocuments);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Generate verification token
      const verificationToken = generateVerificationToken(user.id);

      return res.status(201).json({
        message: 'Registration initiated. Awaiting verification and admin approval.',
        userId: user.id,
        companyId: company.id,
        verificationToken
      });

    } catch (error: unknown) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();

      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      logger.error('Manufacturer registration error:', error);
      return res.status(500).json({ message: errorMessage });
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.body;
      const { userId } = verifyEmailToken(token);

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.status = true; // Activate user
      await userRepository.save(user);

      return res.status(200).json({ 
        message: 'Email successfully verified',
        userId: user.id
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      logger.error('Email verification error:', error);
      return res.status(400).json({ message: errorMessage });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ 
        where: { email },
        relations: ['company']
      });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check email verification
      if (!user.status) {
        return res.status(403).json({ message: 'Please verify your email first' });
      }

      // Check company status
      if (!user.company.status) {
        return res.status(403).json({ message: 'Company account is pending approval' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          role: user.role, 
          companyId: user.company.id 
        },
        config.jwtSecret,
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          companyId: user.company.id
        }
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      logger.error('Login error:', error);
      return res.status(500).json({ message: errorMessage });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate password reset token
      const resetToken = generateVerificationToken(user.id);

      // TODO: Send password reset email with resetToken

      return res.status(200).json({ 
        message: 'Password reset link sent to your email',
        resetToken 
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      logger.error('Forgot password error:', error);
      return res.status(500).json({ message: errorMessage });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      const { userId } = verifyEmailToken(token);

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.passwordHash = hashedPassword;
      await userRepository.save(user);

      return res.status(200).json({ 
        message: 'Password successfully reset' 
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      logger.error('Reset password error:', error);
      return res.status(400).json({ message: errorMessage });
    }
  }
}