import { DataTypes, Model } from 'sequelize';
import sequelize from './init';
import { v4 as uuidv4 } from 'uuid';

export class Contact extends Model {
  public id!: string;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public phone?: string;
  public company?: string;
  public status!: 'lead' | 'contact' | 'customer' | 'archived';
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
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: 'contacts',
    underscored: true,
  }
);

export default Contact;
