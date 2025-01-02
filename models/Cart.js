import mongoose from 'mongoose';

// Define the schema for each item in the cart
const cartItemSchema = mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true } // Adds createdAt and updatedAt fields
);

// Define the main cart schema
const cartSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [cartItemSchema],  // Sub-schema for cart items
        totalAmount: {
            type: Number,
            default: 0,  // Default total amount is 0
        },
    },
    { timestamps: true } // Adds createdAt and updatedAt fields
);

// Create the model using the cart schema
const Cart = mongoose.model('Cart', cartSchema);

// Export the Cart model for use in controllers
export default Cart;
