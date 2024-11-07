import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Product } from '../entities/Product';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export class ProductController {
  async create(req: AuthRequest, res: Response) {
    try {
      const productRepository = getRepository(Product);
      const product = productRepository.create({
        ...req.body,
        companyId: req.user!.companyId!
      });
      
      await productRepository.save(product);
      return res.status(201).json(product);
    } catch (error) {
      logger.error('Product creation error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const productRepository = getRepository(Product);
      const products = await productRepository.find({
        where: { companyId: req.user!.companyId },
        relations: ['dpcs']
      });
      
      return res.json(products);
    } catch (error) {
      logger.error('Get products error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const productRepository = getRepository(Product);
      
      const product = await productRepository.findOne({
        where: { 
          id,
          companyId: req.user!.companyId 
        },
        relations: ['dpcs']
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.json(product);
    } catch (error) {
      logger.error('Get product error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const productRepository = getRepository(Product);
      
      let product = await productRepository.findOne({
        where: { 
          id,
          companyId: req.user!.companyId 
        }
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      product = productRepository.merge(product, req.body);
      await productRepository.save(product);

      return res.json(product);
    } catch (error) {
      logger.error('Update product error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const productRepository = getRepository(Product);
      
      const product = await productRepository.findOne({
        where: { 
          id,
          companyId: req.user!.companyId 
        }
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      await productRepository.remove(product);
      return res.status(204).send();
    } catch (error) {
      logger.error('Delete product error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}