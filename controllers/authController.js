const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.register = async (req, res) => {
    const { username, email, password } = req.body;
  
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: 'User already exists' });
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword
      });
  
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: newUser._id,
          username: newUser.username
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
// Login User
exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: 'Invalid email or password' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2d' });
  
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          isAdmin: user.isAdmin
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  