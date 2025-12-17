import sequelize from '../config/database.js';
import RoleModel from './Role.js';
import UserModel from './User.js';
import CategoryModel from './Category.js';
import ProductModel from './Product.js';
import OrderModel from './Order.js';
import OrderItemModel from './OrderItem.js';
import ReservationModel from './Reservation.js';
import PromotionModel from './Promotion.js';
import ComplaintModel from './Complaint.js';
import StockAlertModel from './StockAlert.js';
import StockMovementModel from './StockMovement.js';
import PaymentMethodModel from './PaymentMethod.js';
import PaymentModel from './Payment.js';
import NotificationModel from './Notification.js';
import TaskModel from './Task.js';

const Role = RoleModel(sequelize);
const User = UserModel(sequelize);
const Category = CategoryModel(sequelize);
const Product = ProductModel(sequelize);
const Order = OrderModel(sequelize);
const OrderItem = OrderItemModel(sequelize);
const Reservation = ReservationModel(sequelize);
const Promotion = PromotionModel(sequelize);
const Complaint = ComplaintModel(sequelize);
const StockAlert = StockAlertModel(sequelize);
const StockMovement = StockMovementModel(sequelize);
const PaymentMethod = PaymentMethodModel(sequelize);
const Payment = PaymentModel(sequelize);
const Notification = NotificationModel(sequelize);
const Task = TaskModel;

// Existing Relationships
User.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(User, { foreignKey: 'role_id' });

Product.belongsTo(Category, { foreignKey: 'category_id' });
Category.hasMany(Product, { foreignKey: 'category_id' });

Product.belongsTo(User, { foreignKey: 'vendor_id', as: 'vendor' });
User.hasMany(Product, { foreignKey: 'vendor_id' });

Order.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Order, { foreignKey: 'user_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

OrderItem.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(OrderItem, { foreignKey: 'product_id' });

// Reservation Relationships
Reservation.belongsTo(User, { foreignKey: 'user_id', as: 'customer' });
User.hasMany(Reservation, { foreignKey: 'user_id' });

Reservation.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(Reservation, { foreignKey: 'product_id' });

Reservation.belongsTo(User, { foreignKey: 'confirmed_by', as: 'confirmer' });

// NEW RELATIONSHIP: Order (Ticket) -> Reservations (Items)
Reservation.belongsTo(Order, { foreignKey: 'order_id' });
Order.hasMany(Reservation, { foreignKey: 'order_id' });

// Promotion Relationships
Promotion.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(Promotion, { foreignKey: 'product_id' });

Promotion.belongsTo(Category, { foreignKey: 'category_id' });
Category.hasMany(Promotion, { foreignKey: 'category_id' });

Promotion.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(Promotion, { foreignKey: 'created_by' });

// Complaint Relationships
Complaint.belongsTo(User, { foreignKey: 'user_id', as: 'customer' });
User.hasMany(Complaint, { foreignKey: 'user_id' });

Complaint.belongsTo(Order, { foreignKey: 'order_id' });
Order.hasMany(Complaint, { foreignKey: 'order_id' });

Complaint.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

// Stock Alert Relationships
StockAlert.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(StockAlert, { foreignKey: 'product_id' });

StockAlert.belongsTo(User, { foreignKey: 'acknowledged_by', as: 'acknowledger' });

// Stock Movement Relationships
StockMovement.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(StockMovement, { foreignKey: 'product_id' });

StockMovement.belongsTo(User, { foreignKey: 'performed_by', as: 'performer' });
User.hasMany(StockMovement, { foreignKey: 'performed_by' });

// Payment Relationships
Payment.belongsTo(Order, { foreignKey: 'order_id' });
Order.hasMany(Payment, { foreignKey: 'order_id' });

Payment.belongsTo(Reservation, { foreignKey: 'reservation_id' });
Reservation.hasMany(Payment, { foreignKey: 'reservation_id' });

Payment.belongsTo(PaymentMethod, { foreignKey: 'payment_method_id' });
PaymentMethod.hasMany(Payment, { foreignKey: 'payment_method_id' });

// Notification Relationships
Notification.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Notification, { foreignKey: 'user_id' });

// Task relationships
Task.belongsTo(User, { as: 'assignedTo', foreignKey: 'assigned_to' });
Task.belongsTo(User, { as: 'createdBy', foreignKey: 'created_by' });
User.hasMany(Task, { as: 'assignedTasks', foreignKey: 'assigned_to' });
User.hasMany(Task, { as: 'createdTasks', foreignKey: 'created_by' });

export {
    sequelize,
    Role,
    User,
    Category,
    Product,
    Order,
    OrderItem,
    Reservation,
    Promotion,
    Complaint,
    StockAlert,
    StockMovement,
    PaymentMethod,
    Payment,
    Notification,
    Task
};