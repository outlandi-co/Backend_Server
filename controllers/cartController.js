import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Add item to cart
export const addToCart = async (req, res) => {
    const { userId } = req.params;
    const { productId, quantity } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // Create a new cart if none exists for the user
            cart = new Cart({ userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex > -1) {
            // If product exists, update quantity and totalPrice
            cart.items[itemIndex].quantity += quantity;
            cart.items[itemIndex].totalPrice = cart.items[itemIndex].quantity * product.price;
        } else {
            // If product doesn't exist, add it to the cart
            cart.items.push({
                productId,
                quantity,
                totalPrice: product.price * quantity,
            });
        }

        // Recalculate totalAmount
        cart.totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);

        // Save the updated cart
        await cart.save();

        res.status(200).json(cart); // Return updated cart
    } catch (error) {
        console.error('Error adding to cart:', error.message);
        res.status(500).json({ message: 'Failed to add to cart. Please try again later.' });
    }
};
