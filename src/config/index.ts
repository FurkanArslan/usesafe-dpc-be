import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'usesafe'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  },
  blockchain: {
    networkName: process.env.BLOCKCHAIN_NETWORK || 'usesafe-network',
    channelName: process.env.BLOCKCHAIN_CHANNEL || 'certification-channel',
    chaincodeName: process.env.BLOCKCHAIN_CHAINCODE || 'certification-contract'
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
};