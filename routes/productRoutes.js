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
});


router.get('/', async (req, res, next) => {
    try {
        console.log('GET /api/products endpoint hit');
        await getProducts(req, res); // getProducts sends the response itself
    } catch (error) {
        console.error('Error in GET /api/products:', error.message);
        next(error); // Pass the error to the global error handler
    }
});



// Admin-Protected Routes (token required)
router.post('/', protect, admin, async (req, res) => {
    try {
        console.log('POST /api/products endpoint hit');
        const newProduct = await createProduct(req, res);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error.message);
        res.status(500).json({ message: 'Server error while creating product' });
    }
});

router.put('/:id', protect, admin, async (req, res) => {
    try {
        console.log(`PUT /api/products/${req.params.id} endpoint hit`);
        const updatedProduct = await updateProduct(req, res);
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error(`Error updating product with ID ${req.params.id}:`, error.message);
        res.status(500).json({ message: 'Server error while updating product' });
    }
});

router.delete('/:id', protect, admin, async (req, res) => {
    try {
        console.log(`DELETE /api/products/${req.params.id} endpoint hit`);
        const deletedProduct = await deleteProduct(req, res);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(`Error deleting product with ID ${req.params.id}:`, error.message);
        res.status(500).json({ message: 'Server error while deleting product' });
    }
});

router.delete('/', protect, admin, async (req, res) => {
    try {
        console.log('DELETE /api/products endpoint hit');
        await deleteAllProducts(req, res);
        res.status(200).json({ message: 'All products deleted successfully' });
    } catch (error) {
        console.error('Error deleting all products:', error.message);
        res.status(500).json({ message: 'Server error while deleting all products' });
    }
});

export default router;
