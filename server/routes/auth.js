const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

// JWT authentication middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ ok: false, message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ ok: false, message: 'Malformed token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwtsecret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: 'Invalid token' });
  }
}


// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ ok: false, message: 'Email already in use' });

    // Save raw password - pre('save') hook in model will hash it
    const user = await User.create({ name, email, password });

    res.json({ ok: true, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(400).json({ ok: false, message: err.message });
  }
});



// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ ok: false, message: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ ok: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'jwtsecret', { expiresIn: '7d' });

    res.json({ ok: true, token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});


// Add new address (authenticated)
router.post('/address', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ ok: false, message: 'User not found' });

  user.addresses.push(req.body);
  await user.save();
  res.json({ ok: true, addresses: user.addresses });
});

// Update address by index (authenticated)
router.put('/address/:index', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ ok: false, message: 'User not found' });

  const index = parseInt(req.params.index);
  if (index < 0 || index >= user.addresses.length) {
    return res.status(400).json({ ok: false, message: 'Invalid address index' });
  }

  user.addresses[index] = req.body;
  await user.save();
  res.json({ ok: true, addresses: user.addresses });
});

module.exports = router;
