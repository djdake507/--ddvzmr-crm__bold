import { DataTypes, Model } from 'sequelize';
import sequelize from '../init';
import { v4 as uuidv4 } from 'uuid';
import Contact from './Contact';

export class Deal extends Model {
  public id!: string;
  public contactId!: string;
  public title!: string;
  public value!: number;
  public stage!: 'prospecting' | 'qualification' | 'negotiation' | 'closed_won' | 'closed_lost';
  public probability!: number;
  public expectedCloseDate?: Date;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Deal.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    contactId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Contact,
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stage: {
      type: DataTypes.ENUM('prospecting', 'qualification', 'negotiation', 'closed_won', 'closed_lost'),
      defaultValue: 'prospecting',
    },
    probability: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    expectedCloseDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'deals',
    underscored: true,
  }
);

Deal.belongsTo(Contact, { foreignKey: 'contactId' });
Contact.hasMany(Deal, { foreignKey: 'contactId' });

export default Deal;
