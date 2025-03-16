const db = require('../config/db');

// Get all products
exports.getAllProducts = (req, res) => {
  const query = 'SELECT * FROM products ORDER BY created_at DESC';
  
  db.all(query, [], (err, products) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }
    res.status(200).send(products);
  });
};

// Get product by ID
exports.getProductById = (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }
    
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    
    res.status(200).send(product);
  });
};

// Create product
exports.createProduct = (req, res) => {
  const { name, price, category, description, image, rating, numReviews } = req.body;
  
  if (!name || !price) {
    return res.status(400).send({ message: "Product name and price are required" });
  }
  
  const query = `INSERT INTO products 
    (name, price, category, description, image, rating, numReviews) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [
    name, 
    price, 
    category || 'Office', 
    description || '', 
    image || '', 
    rating || 0, 
    numReviews || 0
  ], function(err) {
    if (err) {
      return res.status(500).send({ message: err.message });
    }
    
    // Get the newly created product
    db.get('SELECT * FROM products WHERE id = ?', [this.lastID], (err, product) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      
      res.status(201).send(product);
    });
  });
};

// Update product
exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, price, category, description, image, rating, numReviews } = req.body;
  
  const query = `UPDATE products SET 
    name = COALESCE(?, name),
    price = COALESCE(?, price),
    category = COALESCE(?, category),
    description = COALESCE(?, description),
    image = COALESCE(?, image),
    rating = COALESCE(?, rating),
    numReviews = COALESCE(?, numReviews)
    WHERE id = ?`;
  
  db.run(query, [
    name, 
    price, 
    category, 
    description, 
    image, 
    rating,
    numReviews,
    id
  ], function(err) {
    if (err) {
      return res.status(500).send({ message: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).send({ message: "Product not found" });
    }
    
    // Get the updated product
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      
      res.status(200).send(product);
    });
  });
};

// Delete product
exports.deleteProduct = (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).send({ message: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).send({ message: "Product not found" });
    }
    
    res.status(200).send({ message: "Product deleted successfully" });
  });
};