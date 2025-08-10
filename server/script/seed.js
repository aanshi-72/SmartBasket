// scripts/seed.js - Seed sample products and an admin user
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('../models/Product');
const User = require('../models/User');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/smartbasket';

async function connectDB() {
  try {
    await mongoose.connect(MONGO);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}

async function seed() {
  try {
    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});

    // Sample products
    const products = [
      {
        title: 'Organic Bananas',
        price: 29.9,
        unit: 'kg',
        images: ['https://images.unsplash.com/photo-1574226516831-e292d3d7b6b6'],
        category: 'Fresh Fruits',
        featured: true,
        stock: 100
      },
      {
        title: 'Fresh Spinach',
        price: 34.9,
        unit: 'bunch',
        images: ['https://images.unsplash.com/photo-1547516508-4b3b16f48f06'],
        category: 'Vegetables',
        featured: true,
        stock: 50
      },
      {
        title: 'Whole Milk',
        price: 49.9,
        unit: 'litre',
        images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836'],
        category: 'Dairy & Eggs',
        featured: true,
        stock: 200
      }
    ];

    // Insert products
    await Product.insertMany(products);

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin',
      email: 'admin@smartbasket.com',
      password: '123Admin',
      role: 'admin'
    });

    console.log('🌱 Seeded products and admin user successfully');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

(async () => {
  await connectDB();
  await seed();
})();
