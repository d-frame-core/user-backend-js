/** @format */

const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE', // Set the default value to 'active'
    },
    websites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WebsiteData',
      },
    ],
  },
  {
    timestamps: true, // Add timestamps for createdAt and updatedAt
  }
);

const Tag = mongoose.model('Tag', tagSchema);

module.exports = { Tag };
