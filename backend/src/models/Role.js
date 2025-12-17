import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Role', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    }
  }, {
    timestamps: false,
    tableName: 'roles'
  });
};