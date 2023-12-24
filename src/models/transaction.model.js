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
    enum: ['PENDING', 'COMPLETED', 'UNDERREVIEW', 'CANCELLED'],
    default: 'PENDING',
  },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { Transaction };
