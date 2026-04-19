import { Sequelize } from 'sequelize';
import { config } from 'dotenv';

config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.SQLITE_DB_PATH || './trekking-app.db',
});

export default sequelize;