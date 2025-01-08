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

// Middleware to log incoming requests for debugging
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Public Routes (no token required)
router.get('/', async (req, res) => {
    try {
        console.log('GET /api/products hit');
        await getProducts(req, res);
    } catch (error) {
        console.error('Error in GET /api/products:', error.message);
        res.status(500).json({ message: 'Server error while fetching products' });
    }
}); // Get all products

router.get('/:id', async (req, res) => {
    try {
        console.log(`GET /api/products/${req.params.id} hit`);
        await getProductById(req, res);
    } catch (error) {
        console.error(`Error in GET /api/products/${req.params.id}:`, error.message);
        res.status(500).json({ message: 'Server error while fetching the product' });
    }
}); // Get a product by ID

// Admin-Protected Routes (token required)
router.post('/', protect, admin, async (req, res) => {
    try {
        console.log('POST /api/products hit');
        await createProduct(req, res);
    } catch (error) {
        console.error('Error in POST /api/products:', error.message);
        res.status(500).json({ message: 'Server error while creating product' });
    }
}); // Create product

router.put('/:id', protect, admin, async (req, res) => {
    try {
        console.log(`PUT /api/products/${req.params.id} hit`);
        await updateProduct(req, res);
    } catch (error) {
        console.error(`Error in PUT /api/products/${req.params.id}:`, error.message);
        res.status(500).json({ message: 'Server error while updating product' });
    }
}); // Update product

router.delete('/:id', protect, admin, async (req, res) => {
    try {
        console.log(`DELETE /api/products/${req.params.id} hit`);
        await deleteProduct(req, res);
    } catch (error) {
        console.error(`Error in DELETE /api/products/${req.params.id}:`, error.message);
        res.status(500).json({ message: 'Server error while deleting product' });
    }
}); // Delete product

router.delete('/', protect, admin, async (req, res) => {
    try {
        console.log('DELETE /api/products hit');
        await deleteAllProducts(req, res);
    } catch (error) {
        console.error('Error in DELETE /api/products:', error.message);
        res.status(500).json({ message: 'Server error while deleting all products' });
    }
}); // Delete all products

export default router;
