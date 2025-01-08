// backend/routes/checkoutRoutes.js
import express from 'express';
import Order from '../models/Order.js'; // Create an Order model (see Step 2)
import { protect } from '../middleware/authMiddleware.js';
import { processPayment } from '../utils/paymentProcessor.js'; // This will handle Stripe payment

const router = express.Router();

// POST endpoint to process checkout
router.post('/', protect, async (req, res) => {
    const { cartItems, shippingInfo, totalPrice } = req.body;

    try {
        // 1. Process the payment with Stripe (see Step 3 for implementation)
        const paymentResult = await processPayment(totalPrice, shippingInfo);

        if (!paymentResult.success) {
            return res.status(400).json({ message: 'Payment failed' });
        }

        // 2. Create a new order in the database
        const newOrder = await Order.create({
            items: cartItems,
            shippingAddress: shippingInfo,
            totalPrice,
            paymentStatus: paymentResult.status,  // For example, 'paid' or 'failed'
        });

        // 3. Send confirmation email (see Step 4 for implementation)
        sendOrderConfirmationEmail(newOrder);

        // 4. Clear cart after successful order placement
        // (Optionally, you could remove cart data from localStorage or database for guest users)

        res.status(201).json({ message: 'Order placed successfully!', orderId: newOrder._id });
    } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).json({ message: 'Failed to place order' });
    }
});

export default router;
