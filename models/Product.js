import mongoose from 'mongoose';

// Define the Product schema
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: '' }, // Default to an empty string if no description is provided
    category: { type: String, default: '' }, // Default to an empty string if no category is provided
    quantity: { type: Number, required: true, default: 0 }, // Ensure a default value
    photo: { type: String, default: '' }, // Default to an empty string if no photo is provided
});

// Create and export the Product model
const Product = mongoose.model('Product', productSchema);
export default Product;
