import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { Order, OrderItem, Product, User } from '../models/index.js';

class PDFService {
    /**
     * Generate order ticket PDF
     */
    async generateOrderTicket(orderId) {
        try {
            // Fetch order with all details
            const order = await Order.findByPk(orderId, {
                include: [
                    {
                        model: OrderItem,
                        include: [{ model: Product, attributes: ['name', 'price'] }]
                    },
                    {
                        model: User,
                        attributes: ['first_name', 'last_name', 'email']
                    }
                ]
            });

            if (!order) {
                throw new Error('Order not found');
            }

            // Create PDF document
            const doc = new PDFDocument({ size: 'A4', margin: 50 });

            // Generate QR Code
            const qrCodeData = `ORDER-${order.id}`;
            const qrCodeImage = await QRCode.toDataURL(qrCodeData);

            // Header
            doc.fontSize(24).font('Helvetica-Bold').text('WhiteStar', { align: 'center' });
            doc.fontSize(12).font('Helvetica').text('Fragancias Premium', { align: 'center' });
            doc.moveDown();

            // Ticket Title
            doc.fontSize(18).font('Helvetica-Bold').text('TICKET DE COMPRA', { align: 'center' });
            doc.moveDown();

            // Order Info
            doc.fontSize(10).font('Helvetica');
            doc.text(`Ticket #: ${order.id.substring(0, 8).toUpperCase()}`, 50, doc.y);
            doc.text(`Fecha: ${new Date(order.created_at).toLocaleString('es-CL')}`, 50, doc.y);
            doc.text(`Estado: ${order.status}`, 50, doc.y);
            doc.moveDown();

            // Customer Info
            doc.fontSize(12).font('Helvetica-Bold').text('Cliente:', 50, doc.y);
            doc.fontSize(10).font('Helvetica');
            doc.text(`${order.User.first_name} ${order.User.last_name}`, 50, doc.y);
            doc.text(`${order.User.email}`, 50, doc.y);
            doc.moveDown();

            // Line separator
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Products Table Header
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Producto', 50, doc.y, { width: 250, continued: false });
            doc.text('Cant.', 320, doc.y - 12, { width: 50, align: 'center' });
            doc.text('Precio', 380, doc.y - 12, { width: 80, align: 'right' });
            doc.text('Total', 470, doc.y - 12, { width: 80, align: 'right' });
            doc.moveDown(0.5);

            // Line separator
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            // Products
            doc.font('Helvetica');
            let subtotal = 0;

            order.OrderItems.forEach((item) => {
                const itemTotal = parseFloat(item.price) * item.quantity;
                subtotal += itemTotal;

                doc.text(item.Product.name, 50, doc.y, { width: 250 });
                doc.text(item.quantity.toString(), 320, doc.y - 12, { width: 50, align: 'center' });
                doc.text(`$${parseFloat(item.price).toLocaleString('es-CL')}`, 380, doc.y - 12, { width: 80, align: 'right' });
                doc.text(`$${itemTotal.toLocaleString('es-CL')}`, 470, doc.y - 12, { width: 80, align: 'right' });
                doc.moveDown(0.8);
            });

            // Line separator
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Totals
            doc.font('Helvetica');
            doc.text('Subtotal:', 380, doc.y, { width: 90, align: 'right' });
            doc.text(`$${subtotal.toLocaleString('es-CL')}`, 470, doc.y - 12, { width: 80, align: 'right' });
            doc.moveDown(0.5);

            if (order.tax && order.tax > 0) {
                doc.text('IVA (19%):', 380, doc.y, { width: 90, align: 'right' });
                doc.text(`$${parseFloat(order.tax).toLocaleString('es-CL')}`, 470, doc.y - 12, { width: 80, align: 'right' });
                doc.moveDown(0.5);
            }

            doc.fontSize(12).font('Helvetica-Bold');
            doc.text('TOTAL:', 380, doc.y, { width: 90, align: 'right' });
            doc.text(`$${parseFloat(order.total).toLocaleString('es-CL')}`, 470, doc.y - 12, { width: 80, align: 'right' });
            doc.moveDown(2);

            // QR Code
            doc.image(qrCodeImage, 230, doc.y, { width: 120, height: 120 });
            doc.moveDown(8);

            // Footer
            doc.fontSize(8).font('Helvetica').fillColor('#666');
            doc.text('Escanea el código QR para verificar tu ticket', { align: 'center' });
            doc.moveDown(0.5);
            doc.text('WhiteStar - Fragancias Premium', { align: 'center' });
            doc.text('www.whitestar.cl | contacto@whitestar.cl', { align: 'center' });

            return doc;
        } catch (error) {
            console.error('Error generating PDF ticket:', error);
            throw error;
        }
    }

    /**
     * Generate reservation ticket PDF
     */
    async generateReservationTicket(reservationId) {
        // Similar implementation for reservations
        // Can be implemented later if needed
        throw new Error('Not implemented yet');
    }
}

export default new PDFService();
