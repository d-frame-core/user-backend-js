/** @format */

const mongoose = require('mongoose');

const websiteDataSchema = new mongoose.Schema(
  {
    website: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    visitorCounts: {
      type: Number,
      default: 0,
    },
    userId: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'DFrameUser',
        },
      ],
      default: [],
    },
    status: {
      type: String,
      default: 'UNTAGGED', //untagged , Taggable , Tagged,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

const WebsiteData = mongoose.model('WebsiteData', websiteDataSchema);

module.exports = { WebsiteData };
