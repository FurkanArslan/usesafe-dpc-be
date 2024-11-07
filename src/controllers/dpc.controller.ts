import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { DPC, DPCStatus } from '../entities/DPC';
import { Product } from '../entities/Product';
import { AuthRequest } from '../middleware/auth';
import { BlockchainService } from '../services/BlockchainService';
import { logger } from '../utils/logger';

export class DPCController {
  async create(req: AuthRequest, res: Response) {
    try {
      const { productId, certificationDetails } = req.body;
      const dpcRepository = getRepository(DPC);
      const productRepository = getRepository(Product);

      // Verify product belongs to company
      const product = await productRepository.findOne({
        where: { 
          id: productId,
          companyId: req.user!.companyId 
        }
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const dpc = dpcRepository.create({
        productId,
        certificationDetails,
        status: DPCStatus.PENDING
      });

      await dpcRepository.save(dpc);
      return res.status(201).json(dpc);
    } catch (error) {
      logger.error('DPC creation error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const dpcRepository = getRepository(DPC);
      const dpcs = await dpcRepository
        .createQueryBuilder('dpc')
        .innerJoin('dpc.product', 'product')
        .where('product.companyId = :companyId', { companyId: req.user!.companyId })
        .getMany();

      return res.json(dpcs);
    } catch (error) {
      logger.error('Get DPCs error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const dpcRepository = getRepository(DPC);
      
      const dpc = await dpcRepository
        .createQueryBuilder('dpc')
        .innerJoinAndSelect('dpc.product', 'product')
        .where('dpc.id = :id', { id })
        .andWhere('product.companyId = :companyId', { companyId: req.user!.companyId })
        .getOne();

      if (!dpc) {
        return res.status(404).json({ message: 'DPC not found' });
      }

      return res.json(dpc);
    } catch (error) {
      logger.error('Get DPC error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}