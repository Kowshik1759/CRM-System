const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer contact name is required'],
      trim: true,
      index: true
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
      index: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zip: { type: String, default: '' },
      country: { type: String, default: 'USA' }
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'lead'],
      default: 'active',
      index: true
    },
    source: {
      type: String,
      enum: ['Website', 'Referral', 'Cold Call', 'LinkedIn', 'Email Campaign', 'Trade Show', 'Other'],
      default: 'Website'
    },
    industry: {
      type: String,
      default: 'Technology'
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    notes: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
