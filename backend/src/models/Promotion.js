import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define('Promotion', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        discount_type: {
            type: DataTypes.ENUM('percentage', 'fixed_amount'),
            allowNull: false
        },
        discount_value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: { min: 0 }
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: { model: 'products', key: 'id' }
        },
        category_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: { model: 'categories', key: 'id' }
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'users', key: 'id' }
        },
        min_purchase_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0
        },
        max_discount_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        usage_limit: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        usage_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'promotions',
        indexes: [
            { fields: ['product_id'] },
            { fields: ['category_id'] },
            { fields: ['is_active'] },
            { fields: ['start_date', 'end_date'] }
        ]
    });
};
