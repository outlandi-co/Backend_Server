export const createProduct = async (req, res) => {
  console.log('POST /api/products hit');

  // Log the incoming request headers
  console.log('Request headers:', req.headers);

  // Log the raw request body
  console.log('Request body:', req.body);

  const { name, price, image, description, category, brand, stock } = req.body;

  // Log individual fields for debugging
  console.log('Parsed fields:', { name, price, image, description, category, brand, stock });

  if (!name || !price || !image || !description || !category || !brand) {
      console.log('Missing fields:', { name, price, image, description, category, brand });
      return res.status(400).json({
          message: 'All fields are required: name, price, image, description, category, brand, and stock.',
      });
  }

  try {
      const product = new Product({
          name,
          price,
          image,
          description,
          category,
          brand,
          stock,
      });

      const createdProduct = await product.save();
      console.log('Product created:', createdProduct);
      res.status(201).json(createdProduct);
  } catch (error) {
      if (error.name === 'ValidationError') {
          console.error('Validation Error Details:', error.errors);
          return res.status(400).json({ message: error.message, errors: error.errors });
      }
      console.error('Error creating product:', error.message);
      res.status(500).json({ message: 'Server error while creating product.' });
  }
};
