import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      references: { model: 'users', key: 'id' }
    },
    status: {
      type: DataTypes.ENUM('Pendiente', 'Confirmado', 'Enviado', 'Entregado', 'Cancelado'),
      defaultValue: 'Pendiente'
    },
    payment_status: {
      type: DataTypes.ENUM('Pendiente', 'Completado', 'Fallido', 'Reembolsado'),
      defaultValue: 'Pendiente'
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    tax: DataTypes.DECIMAL(10, 2),
    ticket_number: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      comment: 'Digital ticket number for customer'
    },
    reservation_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'reservations', key: 'id' }
    }
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'orders'
  });
};