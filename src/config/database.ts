import { DataSource } from 'typeorm';
import { config } from '../config';
import { User } from '../entities/User';
import { Company } from '../entities/Company';
import { Product } from '../entities/Product';
import { DPC } from '../entities/DPC';
import { Document } from '../entities/Document';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: config.nodeEnv === 'development', // Only in development!
  logging: config.nodeEnv === 'development',
  entities: [User, Company, Product, DPC, Document],
  migrations: [],
  subscribers: []
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};