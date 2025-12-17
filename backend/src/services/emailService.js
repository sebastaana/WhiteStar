import nodemailer from 'nodemailer';

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        // Configuración del transportador
        this.transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    /**
     * Enviar email genérico
     */
    async sendEmail({ to, subject, html, text }) {
        try {
            if (!this.transporter) {
                console.warn('⚠️  Email service not configured. Skipping email send.');
                return { success: false, message: 'Email service not configured' };
            }

            const mailOptions = {
                from: `"WhiteStar" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html,
                text: text || subject
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✓ Email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Email de bienvenida
     */
    async sendWelcomeEmail(user) {
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%); color: #1a1a1a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #D4AF37; color: #1a1a1a; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .highlight { color: #D4AF37; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">¡Bienvenido a WhiteStar!</h1>
          </div>
          <div class="content">
            <h2>Hola ${user.first_name},</h2>
            <p>¡Gracias por registrarte en <span class="highlight">WhiteStar</span>! Estamos emocionados de tenerte con nosotros.</p>
            <p>Tu cuenta ha sido creada exitosamente. Ahora puedes:</p>
            <ul>
              <li>Explorar nuestro catálogo de fragancias premium</li>
              <li>Reservar productos en línea</li>
              <li>Realizar compras seguras</li>
              <li>Recibir notificaciones sobre tus pedidos</li>
            </ul>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/catalog" class="button">
                Explorar Catálogo
              </a>
            </div>
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p>¡Disfruta tu experiencia con WhiteStar!</p>
          </div>
          <div class="footer">
            <p>WhiteStar - Fragancias Premium</p>
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        return this.sendEmail({
            to: user.email,
            subject: '¡Bienvenido a WhiteStar! 🌟',
            html
        });
    }

    /**
     * Email de confirmación de reserva
     */
    async sendReservationConfirmation(reservation, user, product) {
        const expirationDate = new Date(reservation.expiration_date).toLocaleDateString('es-CL');

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%); color: #1a1a1a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          .product-box { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D4AF37; }
          .highlight { color: #D4AF37; font-weight: bold; }
          .warning { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✓ Reserva Confirmada</h1>
          </div>
          <div class="content">
            <h2>Hola ${user.first_name},</h2>
            <p>Tu reserva ha sido <span class="highlight">confirmada exitosamente</span>.</p>
            
            <div class="product-box">
              <h3 style="margin-top: 0;">Detalles de tu Reserva</h3>
              <p><strong>Producto:</strong> ${product.name}</p>
              <p><strong>Cantidad:</strong> ${reservation.quantity} unidad(es)</p>
              <p><strong>Precio:</strong> $${parseFloat(product.price).toFixed(2)}</p>
              <p><strong>Total:</strong> $${(parseFloat(product.price) * reservation.quantity).toFixed(2)}</p>
              <p><strong>Código de Reserva:</strong> <code>${reservation.id.substring(0, 8).toUpperCase()}</code></p>
            </div>

            <div class="warning">
              <strong>⏰ Importante:</strong> Tu reserva expira el <strong>${expirationDate}</strong>. 
              Por favor, completa tu compra antes de esta fecha para asegurar tu producto.
            </div>

            <p>Para completar tu compra, visita nuestra tienda o accede a tu cuenta en línea.</p>
            <p>¡Gracias por elegir WhiteStar!</p>
          </div>
          <div class="footer">
            <p>WhiteStar - Fragancias Premium</p>
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        return this.sendEmail({
            to: user.email,
            subject: `✓ Reserva Confirmada - ${product.name}`,
            html
        });
    }

    /**
     * Email de cambio de estado de orden
     */
    async sendOrderStatusUpdate(order, user, newStatus) {
        const statusMessages = {
            'Pendiente': { emoji: '⏳', message: 'Tu pedido está siendo procesado' },
            'Confirmado': { emoji: '✓', message: 'Tu pedido ha sido confirmado' },
            'Enviado': { emoji: '📦', message: 'Tu pedido está en camino' },
            'Entregado': { emoji: '🎉', message: 'Tu pedido ha sido entregado' }
        };

        const statusInfo = statusMessages[newStatus] || { emoji: '📋', message: 'Estado actualizado' };

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%); color: #1a1a1a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          .status-box { background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #D4AF37; }
          .highlight { color: #D4AF37; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">${statusInfo.emoji} Actualización de Pedido</h1>
          </div>
          <div class="content">
            <h2>Hola ${user.first_name},</h2>
            <p>Tenemos una actualización sobre tu pedido.</p>
            
            <div class="status-box">
              <h3 style="margin-top: 0; font-size: 24px;">${statusInfo.message}</h3>
              <p style="font-size: 18px; margin: 10px 0;">
                Estado: <span class="highlight">${newStatus}</span>
              </p>
              <p style="margin: 5px 0;">
                Pedido #<code>${order.id.substring(0, 8).toUpperCase()}</code>
              </p>
            </div>

            <p><strong>Total del pedido:</strong> $${parseFloat(order.total).toFixed(2)}</p>
            
            ${newStatus === 'Entregado' ?
                '<p>¡Esperamos que disfrutes tu compra! Si tienes algún problema, no dudes en contactarnos.</p>' :
                '<p>Te mantendremos informado sobre cualquier cambio en el estado de tu pedido.</p>'
            }
            
            <p>Gracias por tu confianza en WhiteStar.</p>
          </div>
          <div class="footer">
            <p>WhiteStar - Fragancias Premium</p>
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        return this.sendEmail({
            to: user.email,
            subject: `${statusInfo.emoji} Actualización de Pedido #${order.id.substring(0, 8).toUpperCase()}`,
            html
        });
    }

    /**
     * Email de alerta de stock bajo (para administradores)
     */
    async sendLowStockAlert(product, adminEmail) {
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: #ffffff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          .alert-box { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
          .highlight { color: #dc3545; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">⚠️ Alerta de Stock Bajo</h1>
          </div>
          <div class="content">
            <h2>Atención Administrador,</h2>
            <p>El siguiente producto tiene <span class="highlight">stock bajo</span> y requiere atención:</p>
            
            <div class="alert-box">
              <h3 style="margin-top: 0;">${product.name}</h3>
              <p><strong>Stock actual:</strong> <span class="highlight">${product.stock} unidades</span></p>
              <p><strong>Categoría:</strong> ${product.Category?.name || 'N/A'}</p>
              <p><strong>Precio:</strong> $${parseFloat(product.price).toFixed(2)}</p>
            </div>

            <p>Se recomienda reabastecer este producto lo antes posible para evitar pérdida de ventas.</p>
            <p>Accede al panel de administración para gestionar el inventario.</p>
          </div>
          <div class="footer">
            <p>WhiteStar - Sistema de Gestión</p>
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        return this.sendEmail({
            to: adminEmail,
            subject: `⚠️ Alerta: Stock Bajo - ${product.name}`,
            html
        });
    }

    /**
     * Email de orden creada
     */
    async sendOrderCreated(order, user) {
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%); color: #1a1a1a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          .order-box { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .highlight { color: #D4AF37; font-weight: bold; }
          .success { background: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎉 ¡Pedido Confirmado!</h1>
          </div>
          <div class="content">
            <h2>Hola ${user.first_name},</h2>
            
            <div class="success">
              <strong>✓ ¡Tu pedido ha sido creado exitosamente!</strong>
            </div>

            <p>Gracias por tu compra. Aquí están los detalles de tu pedido:</p>
            
            <div class="order-box">
              <h3 style="margin-top: 0;">Detalles del Pedido</h3>
              <p><strong>Número de Pedido:</strong> #${order.id.substring(0, 8).toUpperCase()}</p>
              <p><strong>Total:</strong> $${parseFloat(order.total).toFixed(2)}</p>
              <p><strong>Estado:</strong> <span class="highlight">${order.status}</span></p>
            </div>

            <p>Recibirás actualizaciones por email sobre el estado de tu pedido.</p>
            <p>Puedes ver los detalles completos de tu pedido en tu cuenta.</p>
            <p>¡Gracias por confiar en WhiteStar!</p>
          </div>
          <div class="footer">
            <p>WhiteStar - Fragancias Premium</p>
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        return this.sendEmail({
            to: user.email,
            subject: `🎉 Pedido Confirmado #${order.id.substring(0, 8).toUpperCase()}`,
            html
        });
    }
}

export default new EmailService();
