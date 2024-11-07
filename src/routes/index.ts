import { Express } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import companyRoutes from './company.routes';
import productRoutes from './product.routes';
import dpcRoutes from './dpc.routes';
import adminRoutes from './admin.routes';

export const setupRoutes = (app: Express) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/companies', companyRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/dpcs', dpcRoutes);
  app.use('/api/admin', adminRoutes);
};