import { DataTypes, Model } from 'sequelize';
import sequelize from '../init';
import { v4 as uuidv4 } from 'uuid';

export class KPIMetric extends Model {
  public id!: string;
  public tenantId!: string;
  public customerId?: string;
  public representativeId?: string;
  public metricName!: string;
  public value!: number;
  public trend?: 'up' | 'down' | 'stable';
  public calculatedAt!: Date;
  public period?: string; // e.g., 'daily', 'weekly', 'monthly'
  public metadata?: Record<string, any>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

KPIMetric.init(
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
    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'contacts',
        key: 'id',
      },
    },
    representativeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    metricName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'e.g., churn_risk, health_score, engagement_score, revenue, cac, ltv',
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
      comment: 'Numeric value (0-100 for scores, or absolute value for revenue/cost)',
    },
    trend: {
      type: DataTypes.ENUM('up', 'down', 'stable'),
      allowNull: true,
    },
    period: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'daily',
    },
    calculatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'Additional context (e.g., comparison_value, previous_value)',
    },
  },
  {
    sequelize,
    tableName: 'kpi_metrics',
    timestamps: true,
    indexes: [
      { fields: ['tenantId', 'metricName'] },
      { fields: ['customerId', 'metricName'] },
      { fields: ['calculatedAt'] },
    ],
  }
);

export default KPIMetric;
