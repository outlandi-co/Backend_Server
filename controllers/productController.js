import Product from '../models/Product.js';

// Get all products
export const getProducts = async (req, res) => {
    console.log('Fetching all products...');
    try {
        const products = await Product.find();
        console.log(`Fetched ${products.length} products`);
        return res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        return res.status(500).json({
            message: 'Failed to fetch products. Please try again later.',
            error: error.message,
        });
    }
};

// Get a single product by ID
export const getProductById = async (req, res) => {
    console.log(`Fetching product with ID: ${req.params.id}`);
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            console.log('Product not found.');
            return res.status(404).json({ message: 'Product not found.' });
        }
        console.log('Fetched product:', product);
        return res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching product:', error.message);
        return res.status(500).json({
            message: 'Failed to fetch product. Please try again later.',
            error: error.message,
        });
    }
};

// Create a new product
export const createProduct = async (req, res) => {
    console.log('Creating new product with data:', req.body);
    const { name, price, description, category, quantity, photo } = req.body;

    if (!name || price == null) {
        console.log('Validation error: Name and price are required.');
        return res.status(400).json({ message: 'Name and price are required.' });
    }

    try {
        const newProduct = new Product({ name, price, description, category, quantity, photo });
        const savedProduct = await newProduct.save();
        console.log('Product created successfully:', savedProduct);
        return res.status(201).json({
            message: 'Product created successfully!',
            product: savedProduct,
        });
    } catch (error) {
        console.error('Error creating product:', error.message);
        return res.status(500).json({
            message: 'Failed to create product. Please try again later.',
            error: error.message,
        });
    }
};

// Update a product
export const updateProduct = async (req, res) => {
    console.log(`Updating product with ID: ${req.params.id}`);
    const { name, price, description, category, quantity, photo } = req.body;

    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            console.log('Product not found.');
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Update fields only if provided
        if (name) product.name = name;
        if (price != null) product.price = price;
        if (description) product.description = description;
        if (category) product.category = category;
        if (quantity != null) product.quantity = quantity;
        if (photo) product.photo = photo;

        const updatedProduct = await product.save();
        console.log('Product updated successfully:', updatedProduct);
        return res.status(200).json({
            message: 'Product updated successfully!',
            product: updatedProduct,
        });
    } catch (error) {
        console.error('Error updating product:', error.message);
        return res.status(500).json({
            message: 'Failed to update product. Please try again later.',
            error: error.message,
        });
    }
};

// Delete a single product
export const deleteProduct = async (req, res) => {
    console.log(`Deleting product with ID: ${req.params.id}`);
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            console.log('Product not found.');
            return res.status(404).json({ message: 'Product not found.' });
        }

        console.log('Product deleted successfully.');
        return res.status(200).json({ message: 'Product deleted successfully.' });
    } catch (error) {
        console.error('Error deleting product:', error.message);
        return res.status(500).json({
            message: 'Failed to delete product. Please try again later.',
            error: error.message,
        });
    }
};

// Delete all products
export const deleteAllProducts = async (req, res) => {
    console.log('Deleting all products...');
    try {
        const result = await Product.deleteMany({});
        console.log(`Deleted ${result.deletedCount} products`);
        return res.status(200).json({
            message: 'All products deleted successfully.',
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error('Error deleting all products:', error.message);
        return res.status(500).json({
            message: 'Failed to delete all products. Please try again later.',
            error: error.message,
        });
    }
};
