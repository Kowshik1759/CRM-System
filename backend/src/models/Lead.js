const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lead title or deal summary is required'],
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Lead contact person name is required'],
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
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      index: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    source: {
      type: String,
      enum: ['Website', 'Referral', 'Cold Call', 'LinkedIn', 'Email Campaign', 'Trade Show', 'Other'],
      default: 'Website',
      index: true
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Converted', 'Lost'],
      default: 'New',
      index: true
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    estimatedValue: {
      type: Number,
      default: 0
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    convertedCustomerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    convertedAt: {
      type: Date
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

module.exports = mongoose.model('Lead', leadSchema);
