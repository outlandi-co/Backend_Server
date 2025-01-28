import express from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.get('/', getProducts);  // Get all products
router.get('/:id', getProductById); // Get product by ID

// Admin Routes (Protected)
router.post('/', protect, admin, createProduct); // Create a new product
router.put('/:id', protect, admin, updateProduct); // Update product
router.delete('/:id', protect, admin, deleteProduct); // Delete product

export default router;
