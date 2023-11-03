/** @format */

const mongoose = require('mongoose');

const KYCStatus = {
  UNSUBMITTED: 'UNSUBMITTED',
  UNVERIFIED: 'UNVERIFIED',
  VERIFIED: 'VERIFIED',
  STOP: 'STOP',
  RESUBMIT: 'RESUBMIT',
  RESUBMITTED: 'RESUBMITTED',
};

const kycEntry = {
  refId: { type: mongoose.Schema.Types.ObjectId },
  rewards: { type: Number },
  date: { type: String },
  status: { type: String, default: 'UNPAID' },
  lastUpdated: { type: Date },
};

const rewardsEntryWithRefId = [
  {
    refId: { type: mongoose.Schema.Types.ObjectId },
    rewards: { type: Number },
    timestamp: { type: String },
  },
];

const dFrameUserSchema = new mongoose.Schema(
  {
    publicAddress: { type: String, required: true, unique: true },
    cid: [{ type: String }],
    referralCode: { type: String, default: '' },
    kyc1: {
      status: {
        type: String,
        enum: Object.values(KYCStatus),
        default: KYCStatus.UNSUBMITTED,
      },
      details: {
        firstName: { type: String, default: '' },
        lastName: { type: String, default: '' },
        userName: { type: String, default: '' },
        phoneNumber: { type: String, default: '' },
        email: { type: String, default: '' },
      },
    },
    kyc2: {
      status: {
        type: String,
        enum: Object.values(KYCStatus),
        default: KYCStatus.UNSUBMITTED,
      },
      details: {
        gender: { type: String, default: '' },
        country: { type: String, default: '' },
        state: { type: String, default: '' },
        city: { type: String, default: '' },
        street: { type: String, default: '' },
        doorno: { type: String, default: '' },
        pincode: { type: String, default: '' },
        dob: { type: String, default: '' },
        annualIncome: { type: String, default: '' },
      },
    },
    kyc3: {
      status: {
        type: String,
        enum: Object.values(KYCStatus),
        default: KYCStatus.UNSUBMITTED,
      },
      addressProof: { type: String, default: '' },
      idProof: { type: String, default: '' },
      userPhoto: { type: String, default: '' },
    },
    permissions: {
      location: { type: Boolean, default: true },
      browserData: { type: Boolean, default: true },
      callDataSharing: { type: Boolean, default: true },
      emailSharing: { type: Boolean, default: true },
      notification: { type: Boolean, default: true },
      storageOption: { type: String, enum: ['GCP', 'IPFS'], default: 'GCP' },
    },
    profileImage: { type: String, default: '' },
    tags: {
      dataTags: [String],
      userTags: [String],
      surveyTags: [String],
    },
    userData: [
      {
        dataDate: String,
        urlData: [
          {
            urlLink: String,
            timestamps: [String],
            timespent: [Number],
          },
        ],
      },
    ],

    userAds: [
      {
        date: { type: String },
        ads: [
          {
            adsId: { type: String },
            rewards: { type: Number },
            status: { type: String, default: 'UNSEEN' },
          },
        ],
      },
    ],
    userSurvey: [
      {
        date: { type: String },
        surveys: [
          {
            surveyId: { type: String },
            rewards: { type: Number },
            status: { type: String, default: 'UNSEEN' },
          },
        ],
      },
    ],

    rewards: {
      oneTime: {
        kyc1: kycEntry,
        kyc2: kycEntry,
        kyc3: kycEntry,
      },
      daily: [
        {
          date: { type: String },
          status: { type: String, default: 'UNPAID' },
          browserData: rewardsEntryWithRefId, // Rewards and timestamp as arrays
          ad: rewardsEntryWithRefId, // Rewards and timestamp as arrays
          survey: rewardsEntryWithRefId, // Rewards and timestamp as arrays
          referral: rewardsEntryWithRefId, // Rewards and timestamp as arrays
        },
      ],
    },
    dftForSale: {
      amount: { type: Number, default: 0 },
      status: { type: String, default: 'UNVERIFIED' },
      updatedAt: Number,
      saleHistory: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Transaction',
        },
      ],
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

dFrameUserSchema.statics.build = (attrs) => {
  return new DFrameUser(attrs);
};

const DFrameUser = mongoose.model('DFrameUser', dFrameUserSchema);

module.exports = { DFrameUser, KYCStatus };
