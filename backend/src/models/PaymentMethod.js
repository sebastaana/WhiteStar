import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define('PaymentMethod', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('credit_card', 'debit_card', 'paypal', 'mercadopago', 'transfer', 'cash', 'other'),
            allowNull: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        is_online: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Whether this payment method supports online payments'
        },
        config: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Configuration for payment gateway (API keys, etc.)'
        },
        display_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        icon_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'payment_methods',
        indexes: [
            { fields: ['is_active'] },
            { fields: ['type'] }
        ]
    });
};
