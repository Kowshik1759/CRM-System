const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Opportunity title is required'],
      trim: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      index: true
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      index: true
    },
    value: {
      type: Number,
      required: [true, 'Deal value is required'],
      min: 0
    },
    stage: {
      type: String,
      enum: ['Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
      default: 'Discovery',
      index: true
    },
    probability: {
      type: Number,
      min: 0,
      max: 100,
      default: 20
    },
    expectedCloseDate: {
      type: Date,
      required: [true, 'Expected close date is required']
    },
    actualCloseDate: {
      type: Date
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
    lostReason: {
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

module.exports = mongoose.model('Opportunity', opportunitySchema);
