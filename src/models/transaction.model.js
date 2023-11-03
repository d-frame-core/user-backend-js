/** @format */

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DframeUser', // Reference to DframeUser model
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'under review', 'cancelled'],
    default: 'pending',
  },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { Transaction };
