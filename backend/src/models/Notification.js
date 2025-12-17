import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define('Notification', {
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
        type: {
            type: DataTypes.ENUM(
                'order_created',
                'order_updated',
                'reservation_confirmed',
                'reservation_cancelled',
                'stock_alert',
                'payment_received',
                'complaint_assigned',
                'task_assigned',
                'general'
            ),
            allowNull: false,
            defaultValue: 'general'
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        link: {
            type: DataTypes.STRING,
            comment: 'URL to navigate when clicking notification'
        },
        read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high'),
            defaultValue: 'medium'
        },
        metadata: {
            type: DataTypes.JSON,
            comment: 'Additional data related to the notification'
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'notifications',
        indexes: [
            { fields: ['user_id', 'read'] },
            { fields: ['created_at'] },
            { fields: ['type'] }
        ]
    });
};
