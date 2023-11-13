/** @format */

const express = require('express');
const router = express.Router();
const Survey = require('../models/survey.model'); // Import your Survey model
const { DFrameUser } = require('../models/user.model');
const mongoose = require('mongoose');
const verifyToken = require('../middleware/middleware');
// Define the GET endpoint
router.get('/api/survey-by-id/:surveyId', async (req, res) => {
  const { surveyId } = req.params;

  try {
    // Find the survey by its ID
    const survey = await Survey.findById(surveyId);

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    res.json(survey);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.post('/api/update-survey/:surveyID', verifyToken, async (req, res) => {
  try {
    const surveyID = req.params.surveyID;
    const { userId, options, publicAddress } = req.body;

    const survey = await Survey.findById(surveyID);

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (survey.totalQues.length !== options.length) {
      console.log('ERROR HERE', options.length);
      return res.status(400).json({ message: 'Invalid number of options' });
    }

    options.forEach((selectedOption, index) => {
      const question = survey.totalQues[index];
      const userAnswerIndex = question.options.indexOf(selectedOption);

      if (userAnswerIndex >= 0) {
        if (!question.userAnswers[userAnswerIndex]) {
          question.userAnswers[userAnswerIndex] = [];
        }
        question.userAnswers[userAnswerIndex].push(userId);
      }
    });

    await survey.save();
    // Find the DFrameUser by publicAddress
    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      console.log('ERROR HERE', publicAddress);
      return res.status(404).json({ message: 'User not found' });
    }

    const today = new Date().toLocaleDateString('en-GB');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the survey with the given surveyId for today in the user's userSurvey array
    const surveyToUpdate = user.userSurvey.find(
      (survey) =>
        survey.date === today &&
        survey.surveys.some((s) => s.surveyId === req.params.surveyID)
    );

    if (!surveyToUpdate) {
      return res
        .status(404)
        .json({ message: 'Survey not found for today in user data' });
    }

    // Update the status of the found survey to 'SEEN'
    const surveyIndex = user.userSurvey.findIndex(
      (survey) => survey.date === today
    );
    const foundSurveyIndex = user.userSurvey[surveyIndex].surveys.findIndex(
      (s) => s.surveyId === req.params.surveyID
    );
    user.userSurvey[surveyIndex].surveys[foundSurveyIndex].status = 'SEEN';

    user.rewards = user.rewards || {};
    user.rewards.daily = user.rewards.daily || [];
    const dailyRewards = user.rewards.daily;

    if (
      dailyRewards.length === 0 ||
      !dailyRewards.some((reward) => reward.date === today)
    ) {
      user.rewards.daily.push({
        date: today,
        status: 'UNPAID',
        browserData: [],
        ad: [],
        survey: [],
        referral: [],
      });
    }

    // Generate new refId for each category
    const newRefId = new mongoose.Types.ObjectId();

    // Push new object with a new refId for each category
    user.rewards.daily[user.rewards.daily.length - 1].survey.push({
      refId: newRefId,
      rewards: 1,
      timestamp: new Date().toISOString(),
    });
    await user.save();
    console.log('UPDATED SURVEY', surveyToUpdate);
    res.status(200).json({ message: 'Survey updated successfully' });
  } catch (error) {
    console.log('ERROR IN SURVEY UPDATE', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

router.post('/api/dummy/:publicAddress', async (req, res) => {
  try {
    const publicAddress = req.params.publicAddress;
    const { surveyId } = req.body;
    const today = new Date().toLocaleDateString('en-GB');

    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a new survey object with provided surveyId, rewards 1, and status 'UNSEEN'
    const newSurvey = {
      surveyId,
      rewards: 1,
      status: 'UNSEEN',
    };

    // Check if a survey for today already exists; if not, create a new entry for today
    let todaySurveys = user.userSurvey.find((survey) => survey.date === today);

    if (!todaySurveys) {
      todaySurveys = { date: today, surveys: [] };
      user.userSurvey.push(todaySurveys);
    }

    // Add the new survey to the surveys array for today
    todaySurveys.surveys.push(newSurvey);

    await user.save();

    return res.status(200).json({ message: 'Dummy data added successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post(
  '/api/get-surveys/:publicAddress',
  verifyToken,
  async (req, res) => {
    const { surveyIds } = req.body;
    const publicAddress = req.params.publicAddress;

    try {
      const user = await DFrameUser.findOne({ publicAddress });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Array to store details of found surveys
      const foundSurveys = [];

      for (const surveyId of surveyIds) {
        // Find the survey by its ID
        const survey = await Survey.findById(surveyId);

        if (survey) {
          foundSurveys.push(survey);
        }
      }
      console.log('GET SURVEYS CALLED');
      res.json(foundSurveys);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
);

router.get(
  '/api/rewards-data/:publicAddress',
  verifyToken,
  async (req, res) => {
    const publicAddress = req.params.publicAddress;

    try {
      const user = await DFrameUser.findOne({ publicAddress });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const dailyRewards = user.rewards.daily || [];

      if (dailyRewards.length === 0) {
        return res.json({ surveyCount: 0, totalRewards: 0 });
      }

      let totalSurveyCount = 0;
      let totalRewards = 0;

      // Iterate through each entry in the daily array
      dailyRewards.forEach((entry) => {
        const surveyArray = entry.survey || [];
        totalSurveyCount += surveyArray.length;

        // Calculate the sum of rewards in the survey array for each entry
        const entryTotalRewards = surveyArray.reduce(
          (sum, surveyEntry) => sum + surveyEntry.rewards,
          0
        );
        totalRewards += entryTotalRewards;
      });

      res.json({ surveyCount: totalSurveyCount, totalRewards });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

const SurveyRouter = router;
module.exports = SurveyRouter;
