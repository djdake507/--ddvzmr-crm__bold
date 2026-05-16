import { DataTypes, Model } from 'sequelize';
import sequelize from '../init';
import { v4 as uuidv4 } from 'uuid';

export class Tenant extends Model {
  public id!: string;
  public name!: string;
  public slug!: string;
  public plan!: 'free' | 'pro' | 'enterprise';
  public maxUsers!: number;
  public maxContacts!: number;
  public metadata?: Record<string, any>;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Tenant.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    plan: {
      type: DataTypes.ENUM('free', 'pro', 'enterprise'),
      defaultValue: 'free',
    },
    maxUsers: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    maxContacts: {
      type: DataTypes.INTEGER,
      defaultValue: 1000,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'tenants',
    underscored: true,
  }
);

export default Tenant;
