import { DataTypes, Model } from 'sequelize';
import sequelize from '../init';
import { v4 as uuidv4 } from 'uuid';
import Tenant from './Tenant';

export class Task extends Model {
  public id!: string;
  public tenantId!: string;
  public contactId?: string;
  public dealId?: string;
  public title!: string;
  public description?: string;
  public priority!: 'low' | 'medium' | 'high' | 'urgent';
  public status!: 'open' | 'in_progress' | 'completed' | 'cancelled';
  public dueDate?: Date;
  public assignedToUserId?: string;
  public automationTriggerId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Task.init(
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
    contactId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    dealId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'open',
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    assignedToUserId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    automationTriggerId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'tasks',
    underscored: true,
  }
);

Task.belongsTo(Tenant, { foreignKey: 'tenantId' });
Tenant.hasMany(Task, { foreignKey: 'tenantId' });

export default Task;
