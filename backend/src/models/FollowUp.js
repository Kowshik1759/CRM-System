const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Follow-up title/purpose is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['Call', 'Meeting', 'Email', 'Demo', 'Other'],
      default: 'Call'
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date and time is required'],
      index: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled', 'Overdue'],
      default: 'Pending',
      index: true
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
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
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    notes: {
      type: String,
      default: ''
    },
    outcome: {
      type: String,
      default: ''
    },
    completedAt: {
      type: Date
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FollowUp', followUpSchema);
