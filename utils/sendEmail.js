import sgMail from '@sendgrid/mail';

// Set the SendGrid API Key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Ensure this is set in your .env file

/**
 * Send an order confirmation email to the customer.
 * @param {Object} order - The order object containing order details.
 */
export const sendOrderConfirmationEmail = (order) => {
    // Generate the email content dynamically based on the order details
    const emailContent = `
        <h3>Order Confirmation</h3>
        <p>Thank you for your order!</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <ul>
            ${order.items
                .map(
                    (item) =>
                        `<li>${item.productId.name}: ${item.quantity} x $${item.price.toFixed(
                            2
                        )}</li>`
                )
                .join('')}
        </ul>
        <h4>Total Price: $${order.totalPrice.toFixed(2)}</h4>
        <p><strong>Shipping Address:</strong></p>
        <p>${order.shippingAddress.name}</p>
        <p>${order.shippingAddress.street}, ${order.shippingAddress.city}</p>
        <p>${order.shippingAddress.state}, ${order.shippingAddress.zip}</p>
    `;

    // Configure the email message
    const msg = {
        to: order.shippingAddress.email, // Customer's email
        from: process.env.SENDER_EMAIL,  // Sender email, set in the .env file
        subject: `Order Confirmation - ${order._id}`,
        html: emailContent,
    };

    // Send the email
    sgMail
        .send(msg)
        .then(() => {
            console.log(`Order confirmation email sent to ${order.shippingAddress.email}`);
        })
        .catch((error) => {
            console.error('Error sending email:', error.message);
            console.error('Full error details:', error.response ? error.response.body : error);
        });
};
