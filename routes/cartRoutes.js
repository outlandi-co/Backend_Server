import express from 'express';
import { addToCart, getCart, removeFromCart } from '../controllers/cartController.js';

const router = express.Router();

router.post('/:userId/add', addToCart);
router.get('/:userId', getCart);
router.post('/:itemId/remove', removeFromCart);

export default router;
