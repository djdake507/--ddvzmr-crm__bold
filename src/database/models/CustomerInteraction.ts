import { DataTypes, Model } from 'sequelize';
import sequelize from '../init';
import { v4 as uuidv4 } from 'uuid';

export class CustomerInteraction extends Model {
  public id!: string;
  public tenantId!: string;
  public customerId!: string;
  public representativeId!: string;
  public agentId?: string;
  public type!: 'call' | 'email' | 'meeting' | 'note' | 'sms';
  public transcript?: string;
  public notes?: string;
  public agentInsights?: Array<{
    insight: string;
    confidence: number;
    recommendation?: string;
  }>;
  public outcome?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CustomerInteraction.init(
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
      allowNull: false,
      references: {
        model: 'contacts',
        key: 'id',
      },
    },
    representativeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    agentId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Agent name or ID that provided insights',
    },
    type: {
      type: DataTypes.ENUM('call', 'email', 'meeting', 'note', 'sms'),
      allowNull: false,
    },
    transcript: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Conversation transcript or call recording transcript',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Rep notes on the interaction',
    },
    agentInsights: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of {insight, confidence, recommendation?}',
    },
    outcome: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Result or action taken from interaction',
    },
  },
  {
    sequelize,
    tableName: 'customer_interactions',
    timestamps: true,
    indexes: [
      { fields: ['tenantId', 'customerId'] },
      { fields: ['representativeId'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default CustomerInteraction;
