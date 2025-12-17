import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define('Complaint', {
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
        order_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: { model: 'orders', key: 'id' }
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('Abierto', 'En Proceso', 'Resuelto', 'Cerrado'),
            defaultValue: 'Abierto'
        },
        priority: {
            type: DataTypes.ENUM('Baja', 'Media', 'Alta', 'Urgente'),
            defaultValue: 'Media'
        },
        assigned_to: {
            type: DataTypes.UUID,
            allowNull: true,
            references: { model: 'users', key: 'id' }
        },
        resolution_notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        resolved_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        closed_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        category: {
            type: DataTypes.ENUM('Producto', 'Servicio', 'Entrega', 'Pago', 'Otro'),
            defaultValue: 'Otro'
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'complaints',
        indexes: [
            { fields: ['user_id'] },
            { fields: ['order_id'] },
            { fields: ['status'] },
            { fields: ['priority'] },
            { fields: ['assigned_to'] }
        ]
    });
};
