import { Sequelize } from 'sequelize';
import logger from '@utils/logger';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'agentic_crm',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established');
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('Database models synced');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
}

export default sequelize;
