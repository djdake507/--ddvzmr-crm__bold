import { DataTypes, Model } from 'sequelize';
import sequelize from '../init';
import { v4 as uuidv4 } from 'uuid';

export class CustomerProfileState extends Model {
  public id!: string;
  public tenantId!: string;
  public customerId!: string;
  public pipelineId!: string;
  public currentStage!: string;
  public blockers?: string[];
  public lastTransitionAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CustomerProfileState.init(
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
    pipelineId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'pipelines',
        key: 'id',
      },
    },
    currentStage: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Current stage name in the pipeline',
    },
    blockers: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of blocker reasons preventing stage transition',
    },
    lastTransitionAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the customer last transitioned between stages',
    },
  },
  {
    sequelize,
    tableName: 'customer_profile_states',
    timestamps: true,
    indexes: [
      { fields: ['tenantId', 'customerId'] },
      { fields: ['pipelineId'] },
    ],
  }
);

export default CustomerProfileState;
