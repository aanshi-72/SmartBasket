require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const env = process.env;

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');

const app = express();
app.use(cors({
  origin: env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: env.SESSION_SECRET || 'smartbasket_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => res.send({ status: 'SmartBasket API running' }));

const PORT = env.PORT || 5000;
const MONGO = env.MONGO_URI || 'mongodb://localhost:27017/smartbasket';

mongoose.connect(MONGO)
  .then(()=> {
    console.log('MongoDB connected');
    app.listen(PORT, ()=> console.log('Server started on http://localhost:', PORT));
  })
  .catch(err => console.error('❌ MongoDB Connection error:', err));