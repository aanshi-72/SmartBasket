const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Order = require('../models/orders');
const Product = require('../models/product');
const { verifyToken } = require('../middleware/auth');

// 🛒 Add item to cart (add new or increment qty)
router.post("/add", verifyToken, async (req, res) => {
  try {
    const { product, qty } = req.body;

    if (!product || !qty) {
      return res.status(400).json({ message: "Product and quantity are required" });
    }

    // Find cart for logged in user
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      // Create new cart if not exists
      cart = new Cart({
        userId: req.user.id,
        items: [{ product, qty }]
      });
      await cart.save();
      return res.status(201).json(cart);
    }

    // If cart exists, check if product already in cart
    const itemIndex = cart.items.findIndex(i => i.product.toString() === product);
    if (itemIndex > -1) {
      // Update quantity
      cart.items[itemIndex].qty += qty;
    } else {
      // Add new product to cart
      cart.items.push({ product, qty });
    }

    await cart.save();
    res.status(200).json(cart);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add to cart" });
  }
});

// 🛒 Get cart contents for current user
router.get('/', verifyToken, async (req, res) => {
  try {
    // findOne, not find, because one cart per user
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.product');

    if (!cart) {
      return res.json({ ok: true, cart: { items: [] } });
    }

    res.json({ ok: true, cart });
  } catch (err) {
    res.status(500).json({ ok: false, err: err.message });
  }
});

// 🛒 Remove item from cart by productId
router.delete('/remove/:productId', verifyToken, async (req, res) => {
  try {
    const productId = req.params.productId;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ ok: false, message: 'Cart not found' });

    // Filter out the product to remove
    cart.items = cart.items.filter(item => item.product.toString() !== productId);

    await cart.save();
    res.json({ ok: true, cart });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// 🛍 Checkout: create order from DB cart items
router.post('/checkout', verifyToken, async (req, res) => {
  try {
    const { address, currency = 'INR' } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ ok: false, message: 'Cart is empty' });
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((sum, item) => sum + item.product.price * item.qty, 0);

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: cart.items,
      address,
      totalAmount,
      currency,
      payment: { method: 'COD', status: 'pending' },
      status: 'processing'
    });

    // Clear cart after checkout
    cart.items = [];
    await cart.save();

    res.json({ ok: true, order });
  } catch (err) {
    res.status(500).json({ ok: false, err: err.message });
  }
});

module.exports = router;
