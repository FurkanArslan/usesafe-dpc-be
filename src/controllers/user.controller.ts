import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { hash } from 'bcryptjs';
import { User } from '../entities/User';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export class UserController {
  async create(req: AuthRequest, res: Response) {
    try {
      const userRepository = getRepository(User);
      const { email, password, role } = req.body;

      // Check if user exists
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const passwordHash = await hash(password, 10);
      const user = userRepository.create({
        email,
        passwordHash,
        role,
        companyId: req.user!.companyId!
      });

      await userRepository.save(user);
      return res.status(201).json({
        id: user.id,
        email: user.email,
        role: user.role
      });
    } catch (error) {
      logger.error('User creation error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getCompanyUsers(req: AuthRequest, res: Response) {
    try {
      const userRepository = getRepository(User);
      const users = await userRepository.find({
        where: { companyId: req.user!.companyId },
        select: ['id', 'email', 'role', 'status', 'createdAt']
      });
      
      return res.json(users);
    } catch (error) {
      logger.error('Get users error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userRepository = getRepository(User);
      
      const user = await userRepository.findOne({ 
        where: { 
          id,
          companyId: req.user!.companyId 
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await userRepository.remove(user);
      return res.status(204).send();
    } catch (error) {
      logger.error('Delete user error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}