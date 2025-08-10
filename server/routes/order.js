// routes/order.js
const express = require('express');
const router = express.Router();
const Order = require('../models/orders');
const { verifyToken, isAdmin } = require('../middleware/auth');

// 📦 List all orders (admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ ok: true, orders });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// 📦 Get orders for a specific user (user can only view their own)
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ ok: false, message: 'Access denied' });
    }
    const orders = await Order.find({ user: req.params.userId })
      .sort({ createdAt: -1 });
    res.json({ ok: true, orders });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// 📦 Update order status (admin only)
router.post('/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ ok: true, order });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

module.exports = router;
