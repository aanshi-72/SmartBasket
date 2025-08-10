const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  unit: { 
    type: String, 
    required: true, 
    trim: true 
  },
  images: { 
    type: [String], 
    validate: {
      validator: arr => arr.length > 0,
      message: 'At least one image URL is required'
    }
  },
  category: { 
    type: String, 
    required: true, 
    trim: true 
  },
  featured: { 
    type: Boolean, 
    default: false 
  },
  stock: { 
    type: Number, 
    default: 0, 
    min: 0 
  }
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
