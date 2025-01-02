import express from 'express';
import { addToCart, removeFromCart, getCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';  // Ensure the user is authenticated

const router = express.Router();

// Route to get the user's cart
router.get('/:userId', protect, getCart);

// Route to add a product to the user's cart
router.post('/:userId/add', protect, addToCart);

// Route to remove an item from the user's cart
router.post('/:itemId/remove', protect, removeFromCart);

export default router;
