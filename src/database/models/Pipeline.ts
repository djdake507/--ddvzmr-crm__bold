import { DataTypes, Model } from 'sequelize';
import sequelize from '../init';
import { v4 as uuidv4 } from 'uuid';

export class Pipeline extends Model {
  public id!: string;
  public tenantId!: string;
  public name!: string;
  public description?: string;
  public stages!: Array<{ name: string; order: number; auto_transition?: boolean }>;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Pipeline.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'e.g., Onboarding, Expansion, Churn Recovery',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    stages: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: 'Array of {name, order, auto_transition?}',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'pipelines',
    timestamps: true,
    indexes: [{ fields: ['tenantId'] }],
  }
);

export default Pipeline;
