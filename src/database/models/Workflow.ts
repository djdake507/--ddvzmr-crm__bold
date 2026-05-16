import { DataTypes, Model } from 'sequelize';
import sequelize from '../init';
import { v4 as uuidv4 } from 'uuid';
import Tenant from './Tenant';

export class Workflow extends Model {
  public id!: string;
  public tenantId!: string;
  public name!: string;
  public description?: string;
  public trigger!: string;
  public actions!: any[];
  public isActive!: boolean;
  public executionCount?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Workflow.init(
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
        model: Tenant,
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    trigger: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    actions: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    executionCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'workflows',
    underscored: true,
  }
);

Workflow.belongsTo(Tenant, { foreignKey: 'tenantId' });
Tenant.hasMany(Workflow, { foreignKey: 'tenantId' });

export default Workflow;
