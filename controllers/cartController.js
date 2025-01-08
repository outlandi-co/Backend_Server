import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

/**
 * Add product to cart
 */
export const addToCart = async (req, res) => {
    const { userId } = req.params;
    const { productId, quantity = 1 } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            // Create a new cart if it doesn't exist
            cart = await Cart.create({
                user: userId,
                items: [{ product, quantity }],
            });
        } else {
            // Check if the product already exists in the cart
            const productIndex = cart.items.findIndex(
                (item) => item.product.toString() === productId
            );

            if (productIndex > -1) {
                // Increment the quantity if the product exists
                cart.items[productIndex].quantity += quantity;
            } else {
                // Add the product if it doesn't exist
                cart.items.push({ product, quantity });
            }
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Failed to add product to cart.' });
    }
};

/**
 * Other cart-related functions (e.g., getCart, removeFromCart)
 */
export const getCart = async (req, res) => {
    // Your implementation for fetching the user's cart
};

export const removeFromCart = async (req, res) => {
    // Your implementation for removing items from the cart
};
