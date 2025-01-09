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
            default: '/images/default-product.jpg', // Default value
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['Apparel', 'Electronics', 'Furniture', 'Toys', 'Books'], // Example categories
            trim: true,
        },
        brand: {
            type: String,
            required: [true, 'Brand is required'],
            default: 'Default Brand',
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
        toJSON: { virtuals: true }, // Enable virtual fields in JSON output
        toObject: { virtuals: true }, // Enable virtual fields in plain object output
    }
);

// Add indexes for optimized queries
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function () {
    return `$${this.price.toFixed(2)}`;
});

// Default sorting middleware
productSchema.pre('find', function () {
    this.sort({ createdAt: -1 });
});

// Middleware for logging
productSchema.pre('save', function (next) {
    console.log(`Saving product: ${this.name}`);
    next();
});

// Middleware for debugging queries
productSchema.post('find', function (docs) {
    console.log(`Found ${docs.length} product(s)`);
});

// Middleware for error handling in validation
productSchema.post('save', function (error, doc, next) {
    if (error.name === 'ValidationError') {
        console.error('Validation Error:', error.message);
    }
    next(error);
});

// Middleware for detailed debugging on update
productSchema.pre('updateOne', function () {
    console.log(`Updating product with conditions: ${JSON.stringify(this.getFilter())}`);
    console.log(`Update details: ${JSON.stringify(this.getUpdate())}`);
});

// Ensure model is registered once in Mongoose
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
