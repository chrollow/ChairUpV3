const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// JWT secret key - in production, use environment variables
const JWT_SECRET = 'your-secret-key';

// Register a new user
exports.register = (req, res) => {
  const { name, email, password, phone, profileImage } = req.body;

  // Check if user already exists
  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.get(checkQuery, [email], (err, row) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }
    
    if (row) {
      return res.status(400).send({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Insert user
    const insertQuery = `INSERT INTO users (name, email, password, phone, profile_image) 
                        VALUES (?, ?, ?, ?, ?)`;
    
    db.run(insertQuery, [name, email, hashedPassword, phone, profileImage], function(err) {
      if (err) {
        return res.status(500).send({ message: err.message });
      }

      // Create token
      const token = jwt.sign({ id: this.lastID }, JWT_SECRET, {
        expiresIn: 86400 // 24 hours
      });

      res.status(201).send({
        message: "User registered successfully!",
        user: {
          id: this.lastID,
          name,
          email,
          phone
        },
        token
      });
    });
  });
};

// Login user
exports.login = (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const query = 'SELECT * FROM users WHERE email = ?';
  db.get(query, [email], (err, user) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Check password
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid password" });
    }

    // Create token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: 86400 // 24 hours
    });

    res.status(200).send({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profile_image
      },
      token
    });
  });
};