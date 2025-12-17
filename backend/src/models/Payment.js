import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define('Payment', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        order_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: { model: 'orders', key: 'id' }
        },
        reservation_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: { model: 'reservations', key: 'id' }
        },
        payment_method_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'payment_methods', key: 'id' }
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('Pendiente', 'Procesando', 'Completado', 'Fallido', 'Reembolsado', 'Cancelado'),
            defaultValue: 'Pendiente'
        },
        transaction_id: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'External payment gateway transaction ID'
        },
        payment_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        gateway_response: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Full response from payment gateway'
        },
        error_message: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        refund_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        refund_date: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'payments',
        indexes: [
            { fields: ['order_id'] },
            { fields: ['reservation_id'] },
            { fields: ['status'] },
            { fields: ['transaction_id'] }
        ]
    });
};
