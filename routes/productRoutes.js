import express from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteAllProducts,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes (no token required)
router.get('/', getProducts); // Get all products
router.get('/:id', getProductById); // Get a product by ID

// Admin-Protected Routes (token required)
router.post('/', protect, admin, createProduct); // Create product
router.put('/:id', protect, admin, updateProduct); // Update product
router.delete('/:id', protect, admin, deleteProduct); // Delete product
router.delete('/', protect, admin, deleteAllProducts); // Delete all products

export default router;
