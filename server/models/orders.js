const mongoose = require('mongoose');

// Address sub-schema
const AddressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city:   { type: String, required: true },
    state:  { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' }
}, { _id: false });

// Order item sub-schema
const OrderItemSchema = new mongoose.Schema({
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required: true
    },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, default: 1, min: 1 }
}, { _id: false });

// Payment sub-schema (Cash on Delivery only)
const PaymentSchema = new mongoose.Schema({
    method: { 
        type: String, 
        enum: ['COD'], 
        default: 'COD', 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending','paid'], 
        default: 'pending'
    }
}, { _id: false });

// Main order schema
const OrderSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },

    items: {
        type: [OrderItemSchema],
        validate: {
            validator: arr => arr.length > 0,
            message: 'Order must have at least one item'
        }
    },

    address: { type: AddressSchema, required: true },

    totalAmount: { type: Number, required: true, min: 0 },

    currency: { type: String, default: 'INR' },

    payment: { type: PaymentSchema, required: true },
    
    status: { 
        type: String, 
        enum: ['processing','shipped','delivered','cancelled'], 
        default: 'processing'
    }
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
