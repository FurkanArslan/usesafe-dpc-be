import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Company } from '../entities/Company';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export class CompanyController {
  async create(req: Request, res: Response) {
    try {
      const companyRepository = getRepository(Company);
      const company = companyRepository.create({
        ...req.body,
        status: false // Requires admin approval
      });
      
      await companyRepository.save(company);
      
      return res.status(201).json(company);
    } catch (error) {
      logger.error('Company creation error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const companyRepository = getRepository(Company);
      const companies = await companyRepository.find();
      return res.json(companies);
    } catch (error) {
      logger.error('Get companies error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const companyRepository = getRepository(Company);
      
      // Check if user has access to this company
      if (req.user?.role !== 'admin' && req.user?.companyId !== id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const company = await companyRepository.findOne({ 
        where: { id },
        relations: ['users']
      });

      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      return res.json(company);
    } catch (error) {
      logger.error('Get company error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const companyRepository = getRepository(Company);
      
      // Check if user has access to this company
      if (req.user?.role !== 'admin' && req.user?.companyId !== id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      let company = await companyRepository.findOne({ where: { id } });
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      company = companyRepository.merge(company, req.body);
      await companyRepository.save(company);

      return res.json(company);
    } catch (error) {
      logger.error('Update company error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}