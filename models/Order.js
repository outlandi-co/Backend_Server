// backend/models/Order.js
import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
    {
        items: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
            },
        ],
        shippingAddress: {
            name: String,
            address: String,
            city: String,
            postalCode: String,
            country: String,
        },
        totalPrice: { type: Number, required: true },
        paymentStatus: { type: String, required: true }, // 'paid' or 'failed'
    },
    { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
