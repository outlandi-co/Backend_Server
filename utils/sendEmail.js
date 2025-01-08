// backend/utils/sendEmail.js
import sgMail from '@sendgrid/mail';

sgMail.setApiKey('your_sendgrid_api_key'); // Replace with your SendGrid API key

export const sendOrderConfirmationEmail = (order) => {
    const emailContent = `
        <h3>Order Confirmation</h3>
        <p>Thank you for your order!</p>
        <p>Order ID: ${order._id}</p>
        <ul>
            ${order.items
                .map(
                    (item) =>
                        `<li>${item.productId.name}: ${item.quantity} x $${item.price}</li>`
                )
                .join('')}
        </ul>
        <h4>Total Price: $${order.totalPrice}</h4>
        <p>Shipping Address: ${order.shippingAddress.name}</p>
    `;

    const msg = {
        to: order.shippingAddress.email,  // Send to customer email
        from: 'your_email@example.com',  // Your email
        subject: `Order Confirmation - ${order._id}`,
        html: emailContent,
    };

    sgMail
        .send(msg)
        .then(() => {
            console.log('Order confirmation email sent');
        })
        .catch((error) => {
            console.error('Error sending email:', error);
        });
};
