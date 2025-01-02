import express from 'express';
import Item from '../models/Item.js'; // Ensure the path to your Item model is correct
const router = express.Router();
// Get all items
router.get('/', async (req, res) => {
    try {
        const items = await Item.find();
        res.status(200).json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Error fetching items' });
    }
});
// Add a new item
router.post('/', async (req, res) => {
    const { name, description, price } = req.body;
    if (!name || !description || price == null) {
        return res.status(400).json({ message: 'Name, description, and price are required.' });
    }
    try {
        const newItem = new Item({ name, description, price });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error saving item:', error);
        res.status(500).json({ message: 'Error saving item' });
    }
});
// Update an existing item
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price } = req.body;
    try {
        const item = await Item.findById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        if (name) item.name = name;
        if (description) item.description = description;
        if (price != null) item.price = price;
        await item.save();
        res.status(200).json(item);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ message: 'Error updating item' });
    }
});
// Delete an item
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const item = await Item.findById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        await Item.deleteOne({ _id: id });
        res.status(200).json({ message: 'Item deleted successfully.' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: 'Error deleting item' });
    }
});
export default router;
