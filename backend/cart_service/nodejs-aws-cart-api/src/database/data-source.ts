import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { CartEntity } from '../cart/entities/cart.entity';
import { CartItemEntity } from '../cart/entities/cart-item.entity';
import { CreateCartTables1700000000000 } from '../migrations/1700000000000-CreateCartTables';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [CartEntity, CartItemEntity],
  migrations: [CreateCartTables1700000000000],
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;