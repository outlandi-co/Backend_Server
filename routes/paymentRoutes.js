import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const stripeKey = process.env.STRIPE_SECRET_KEY;

console.log('Stripe Key:', stripeKey ? 'Loaded successfully' : 'Not set'); // Debug log

if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY is not set in the environment variables.');
}

const stripe = new Stripe(stripeKey, { apiVersion: '2022-11-15' });

const router = express.Router();

router.post('/create-payment-intent', async (req, res) => {
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
        console.error('Invalid amount provided:', amount);
        return res.status(400).json({ message: 'Invalid or missing amount.' });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount, // Amount in cents
            currency: 'usd', // Replace with the desired currency
        });

        console.log('Payment Intent created successfully:', paymentIntent.id);
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error.message);
        res.status(500).json({
            message: 'Failed to create payment intent.',
            error: error.message,
        });
    }
});

export default router;
