/** @format */

const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  surveyName: {
    type: String,
    required: true,
  },
  surveyDescription: {
    type: String,
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  totalQues: [
    {
      questionNumber: {
        type: Number,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      options: [
        {
          type: String,
          required: true,
        },
      ],
      userAnswers: [
        [
          {
            type: String,
            ref: 'User',
          },
        ],
      ],
    },
  ],
  userAssigned: [
    {
      type: String,
    },
  ],
  totalRes: {
    type: Number,
  },
  totalReward: {
    type: Number,
    required: true,
  },
  statusCampaign: {
    type: String,
    default: 'UNVERIFIED', //verified,unverified,stop,completed
  },
  startDate: {
    type: String,
    // required: true,
  },
  endDate: {
    type: String,
    // required: true,
  },
});

const Survey = mongoose.model('Survey', surveySchema);

module.exports = Survey;
