import express from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.get('/', getProducts); // Get All Products
router.get('/:id', getProductById); // Get Product by ID

// Admin-Protected Routes
router.post('/', protect, admin, createProduct); // Create Product
router.put('/:id', protect, admin, updateProduct); // Update Product
router.delete('/:id', protect, admin, deleteProduct); // Delete Product

// Export the router as default
export default router;
