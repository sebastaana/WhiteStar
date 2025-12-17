import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      index: true
    },
    description: DataTypes.TEXT,
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    low_stock_threshold: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      comment: 'Threshold for low stock alerts'
    },
    reserved_stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Stock reserved by active reservations'
    },
    category_id: {
      type: DataTypes.UUID,
      references: { model: 'categories', key: 'id' }
    },
    image_url: DataTypes.STRING,
    vendor_id: {
      type: DataTypes.UUID,
      references: { model: 'users', key: 'id' }
    }
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'products',
    indexes: [
      { fields: ['name'] },
      { fields: ['category_id', 'price'] }
    ]
  });
};