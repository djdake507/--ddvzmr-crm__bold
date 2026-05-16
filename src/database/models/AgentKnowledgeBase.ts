import { DataTypes, Model } from 'sequelize';
import sequelize from '../init';
import { v4 as uuidv4 } from 'uuid';

export class AgentKnowledgeBase extends Model {
  public id!: string;
  public tenantId!: string;
  public agentId!: string;
  public trainingData?: {
    source: string;
    historical_interactions_count: number;
    lastTrainedAt: string;
  };
  public trainedModels?: {
    churn_predictor?: { version: string; accuracy: number };
    expansion_predictor?: { version: string; accuracy: number };
    sentiment_model?: { version: string; accuracy: number };
    recommendation_engine?: { version: string; accuracy: number };
  };
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AgentKnowledgeBase.init(
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
    agentId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Agent identifier or name',
    },
    trainingData: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        source: 'initial_import',
        historical_interactions_count: 0,
        lastTrainedAt: null,
      },
      comment: 'Metadata about training sources and history counts',
    },
    trainedModels: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'Trained model versions and accuracy metrics',
    },
  },
  {
    sequelize,
    tableName: 'agent_knowledge_bases',
    timestamps: true,
    indexes: [
      { fields: ['tenantId', 'agentId'] },
    ],
  }
);

export default AgentKnowledgeBase;
