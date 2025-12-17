import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define('Reservation', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'users', key: 'id' }
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'products', key: 'id' }
        },
        order_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: { model: 'orders', key: 'id' }
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1 }
        },
        status: {
            type: DataTypes.ENUM('Pendiente', 'Confirmada', 'Completada', 'Cancelada', 'Expirada'),
            defaultValue: 'Pendiente'
        },
        reservation_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        expiry_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        pickup_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        confirmed_by: {
            type: DataTypes.UUID,
            allowNull: true,
            references: { model: 'users', key: 'id' }
        },
        confirmed_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'reservations',
        indexes: [
            { fields: ['user_id'] },
            { fields: ['product_id'] },
            { fields: ['status'] },
            { fields: ['expiry_date'] }
        ]
    });
};
