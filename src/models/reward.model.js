/** @format */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define your schema
const rewardRequestSchema = new Schema({
  publicAddress: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED'], // Customize as needed
    required: true,
  },
  DframeUserId: {
    type: String, // Assuming DframeUserId is a string, change as needed
    required: true,
  },
});

// Create the model
const RewardRequest = mongoose.model('RewardRequest', rewardRequestSchema);

module.exports = RewardRequest;
