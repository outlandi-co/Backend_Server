import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Product price is required'],
            min: [0, 'Price must be a positive number'],
        },
        image: {
            type: String,
            required: [true, 'Product image is required'],
            default: '/images/default-product.jpg',
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
        },
        brand: {
            type: String,
            required: [true, 'Brand is required'],
            default: 'Default Brand', // Temporary default for debugging
            trim: true,
        },
                stock: {
            type: Number,
            default: 0,
            min: [0, 'Stock cannot be negative'],
        },
    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt
    }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
