import { DataTypes, Model } from 'sequelize';
import sequelize from '../init';
import { v4 as uuidv4 } from 'uuid';

export class Contact extends Model {
  public id!: string;
  public tenantId!: string;
  public vendorCustomerId?: string;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public phone?: string;
  public company?: string;
  public status!: 'lead' | 'contact' | 'customer' | 'archived';
  
  // Dual-layer profile data
  public surfaceData?: Record<string, any>; // Layer 1: External/vendor data (limited access)
  public internalProfile?: Record<string, any>; // Layer 2: Internal CRM-only (redacted, admin+agent access)
  public agentAccessibleProfile?: Record<string, any>; // Subset of Layer 2 for agent collaboration
  
  // KPI and pipeline data
  public kpiMetrics?: Record<string, any>;
  public profilePipelines?: string[]; // Array of pipelineIds
  
  public metadata?: Record<string, any>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Contact.init(
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
    vendorCustomerId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'External vendor/system identifier (Layer 1 ID)',
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('lead', 'contact', 'customer', 'archived'),
      defaultValue: 'lead',
    },
    surfaceData: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'Layer 1: External/vendor data (limited access to software owner)',
    },
    internalProfile: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'Layer 2: Internal CRM-only data (redacted, admin+agent access only)',
    },
    agentAccessibleProfile: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'Subset of internalProfile accessible to agents during collaboration',
    },
    kpiMetrics: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'Cached KPI snapshot for quick dashboard access',
    },
    profilePipelines: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of pipelineIds this customer is in',
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: 'contacts',
    underscored: true,
    indexes: [
      { fields: ['tenantId'] },
      { fields: ['vendorCustomerId'] },
    ],
  }
);

export default Contact;
