const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Call', 'Meeting', 'Email', 'Note', 'Support Ticket'],
      required: true,
      index: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    details: {
      type: String,
      required: [true, 'Interaction details/notes are required']
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
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    durationMinutes: {
      type: Number,
      default: 0
    },
    outcome: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interaction', interactionSchema);
