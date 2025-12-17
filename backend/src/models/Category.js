import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Category', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: DataTypes.TEXT
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'categories'
  });
};