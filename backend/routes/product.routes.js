const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

// For now, just create a simple route
router.get('/', (req, res) => {
  res.json({ message: 'Products API is working' });
});

module.exports = router;