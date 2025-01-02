import Stripe from 'stripe';

const stripe = new Stripe('sk_test_XXXXXXXXXXXXXXXXXXXXXXXX', { apiVersion: '2022-11-15' });

async function testStripe() {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 1000, // $10.00 in cents
            currency: 'usd',
        });
        console.log('PaymentIntent created:', paymentIntent.id);
    } catch (error) {
        console.error('Stripe API error:', error.message);
    }
}

testStripe();
