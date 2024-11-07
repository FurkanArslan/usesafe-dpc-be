import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Company } from '../entities/Company';
import { Document, DocumentStatus } from '../entities/Document';
import { DPC, DPCStatus } from '../entities/DPC';
import { BlockchainService } from '../services/BlockchainService';
import { logger } from '../utils/logger';

export class AdminController {
  async getAllCompanies(req: Request, res: Response) {
    try {
      const companyRepository = getRepository(Company);
      const companies = await companyRepository.find({
        relations: ['users', 'documents']
      });
      return res.json(companies);
    } catch (error) {
      logger.error('Get companies error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateCompanyStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const companyRepository = getRepository(Company);
      
      const company = await companyRepository.findOne({ where: { id } });
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      company.status = status;
      await companyRepository.save(company);
      
      return res.json(company);
    } catch (error) {
      logger.error('Update company status error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getPendingDocuments(req: Request, res: Response) {
    try {
      const documentRepository = getRepository(Document);
      const documents = await documentRepository.find({
        where: { status: DocumentStatus.PENDING },
        relations: ['company']
      });
      return res.json(documents);
    } catch (error) {
      logger.error('Get pending documents error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateDocumentStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const documentRepository = getRepository(Document);
      
      const document = await documentRepository.findOne({ where: { id } });
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      document.status = status;
      await documentRepository.save(document);
      
      return res.json(document);
    } catch (error) {
      logger.error('Update document status error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getPendingDPCs(req: Request, res: Response) {
    try {
      const dpcRepository = getRepository(DPC);
      const dpcs = await dpcRepository.find({
        where: { status: DPCStatus.PENDING },
        relations: ['product', 'product.company']
      });
      return res.json(dpcs);
    } catch (error) {
      logger.error('Get pending DPCs error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateDPCStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const dpcRepository = getRepository(DPC);
      
      const dpc = await dpcRepository.findOne({ 
        where: { id },
        relations: ['product']
      });

      if (!dpc) {
        return res.status(404).json({ message: 'DPC not found' });
      }

      if (status === DPCStatus.APPROVED) {
        const blockchainService = BlockchainService.getInstance();
        const hash = await blockchainService.recordCertification(
          dpc.id,
          {
            productId: dpc.productId,
            certificationDetails: dpc.certificationDetails,
            timestamp: new Date()
          }
        );
        dpc.blockchainHash = hash;
      }

      dpc.status = status;
      await dpcRepository.save(dpc);
      
      return res.json(dpc);
    } catch (error) {
      logger.error('Update DPC status error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}