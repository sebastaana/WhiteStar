import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define('StockAlert', {
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
        threshold: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        current_stock: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        alert_sent: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        acknowledged_by: {
            type: DataTypes.UUID,
            allowNull: true,
            references: { model: 'users', key: 'id' }
        },
        acknowledged_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        severity: {
            type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
            defaultValue: 'Medium'
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'stock_alerts',
        indexes: [
            { fields: ['product_id'] },
            { fields: ['is_active'] },
            { fields: ['alert_sent'] }
        ]
    });
};
