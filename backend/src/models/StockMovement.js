import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define('StockMovement', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'products', key: 'id' }
        },
        movement_type: {
            type: DataTypes.ENUM('entrada', 'salida', 'ajuste', 'venta', 'devolucion', 'reserva', 'cancelacion_reserva'),
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        previous_stock: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        new_stock: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: true
        },
        performed_by: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'users', key: 'id' }
        },
        reference_id: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: 'Reference to Order, Reservation, or other entity'
        },
        reference_type: {
            type: DataTypes.ENUM('order', 'reservation', 'manual', 'adjustment', 'return'),
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'stock_movements',
        indexes: [
            { fields: ['product_id'] },
            { fields: ['movement_type'] },
            { fields: ['performed_by'] },
            { fields: ['created_at'] }
        ]
    });
};
