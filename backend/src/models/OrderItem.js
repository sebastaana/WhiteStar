import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('OrderItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.UUID,
      references: { model: 'orders', key: 'id' }
    },
    product_id: {
      type: DataTypes.UUID,
      references: { model: 'products', key: 'id' }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: DataTypes.DECIMAL(10, 2)
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'order_items'
  });
};