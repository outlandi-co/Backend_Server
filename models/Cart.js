import mongoose from 'mongoose';

// Define the schema for each item in the cart
const cartItemSchema = mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true, // Product ID is required
        },
        quantity: {
            type: Number,
            required: true, // Quantity is required
            default: 1, // Default quantity is 1
        },
        totalPrice: {
            type: Number,
            required: true, // Total price of this item is required
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Define the main cart schema
const cartSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true, // User ID is required
        },
        items: [cartItemSchema], // Array of cart items
        totalAmount: {
            type: Number,
            default: 0, // Default total amount is 0
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Create and export the Cart model
const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
