import { Request, Response } from 'express';
import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { User, UserRole } from '../entities/User';
import { Company } from '../entities/Company';
import { config } from '../config';
import { logger } from '../utils/logger';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, companyName, taxInfo } = req.body;

      const userRepository = getRepository(User);
      const companyRepository = getRepository(Company);

      // Check if user exists
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create company
      const company = companyRepository.create({
        name: companyName,
        taxInfo,
        status: false // Requires admin approval
      });
      await companyRepository.save(company);

      // Create user
      const passwordHash = await hash(password, 10);
      const user = userRepository.create({
        email,
        passwordHash,
        role: UserRole.COMPANY_ADMIN,
        company,
        companyId: company.id
      });
      await userRepository.save(user);

      const token = jwt.sign(
        { id: user.id, role: user.role, companyId: company.id },
        config.jwtSecret,
        { expiresIn: '24h' }
      );

      return res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          companyId: company.id
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ 
        where: { email },
        relations: ['company']
      });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role, companyId: user.companyId },
        config.jwtSecret,
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          companyId: user.companyId
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}