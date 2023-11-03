/** @format */

const { Schema, model } = require('mongoose');

const adSchema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  sessionId: Number,
  campaignName: String,
  campaignType: String,
  adName: String,
  socialMediaPages: {},
  startDate: String,
  startTime: String,
  endDate: String,
  endTime: String,
  audience: {
    location: String,
    ageFrom: Number,
    ageTo: Number,
    gender: String,
  },
  image: String,
  adContent: String,
  adImpressions: Number,
  tags: [String], // Use an array of strings for tags
  assignedUsers: Number,
  users: [Schema.Types.Mixed], // Use a more specific type if possible
  perDay: Number,
  totalDays: Number,
  bidAmount: Number,
  status: {
    type: String,
    default: 'unverified',
  },
});
const AdModel = model('Ad', adSchema);

module.exports = { AdModel };
