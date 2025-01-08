// backend/utils/paymentProcessor.js
import Stripe from 'stripe';
const stripe = new Stripe('your_stripe_secret_key'); // Replace with your Stripe secret key

// Function to process payment using Stripe
export const processPayment = async (totalPrice, shippingInfo) => {
    try {
        // Create a payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalPrice * 100,  // Amount in cents
            currency: 'usd',  // Set the currency
            payment_method_types: ['card'],
            receipt_email: shippingInfo.email,  // Optional: email for the receipt
        });

        return { success: true, status: 'paid', paymentIntentId: paymentIntent.id };
    } catch (error) {
        console.error('Stripe Payment Error:', error);
        return { success: false, status: 'failed' };
    }
};
