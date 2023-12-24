/** @format */

const express = require('express');
const { DFrameUser } = require('../models/user.model'); // Replace with the correct import path for your model
const path = require('path');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const verifyToken = require('../middleware/middleware');
require('dotenv').config();

const router = express.Router();
router.get(
  '/api/rewards/daily/:publicAddress',
  verifyToken,
  async (req, res) => {
    try {
      const publicAddress = req.params.publicAddress;

      // Find the user by public address
      const user = await DFrameUser.findOne({ publicAddress });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

      const today = new Date().toLocaleDateString('en-GB');
      const dates = [];

      // Loop through 7 days starting from 7 days ago
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(sevenDaysAgo);
        currentDate.setDate(sevenDaysAgo.getDate() + i);
        dates.push(currentDate.toLocaleDateString('en-GB'));
      }

      const results = dates.map((date) => {
        const dailyReward = user.rewards.daily.find(
          (entry) => entry.date === date
        ) || {
          date: date,
          browserData: [],
          ad: [],
          survey: [],
          referral: [],
        };

        const browserData = dailyReward.browserData.reduce(
          (acc, entry) => acc + entry.rewards,
          0
        );
        const ads = dailyReward.ad.reduce(
          (acc, entry) => acc + entry.rewards,
          0
        );
        const survey = dailyReward.survey.reduce(
          (acc, entry) => acc + entry.rewards,
          0
        );
        const referral = dailyReward.referral.reduce(
          (acc, entry) => acc + entry.rewards,
          0
        );

        return {
          date,
          browserData,
          ads,
          survey,
          referral,
        };
      });

      res.status(200).json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
);

router.get(
  '/api/rewards/weekly/:publicAddress',
  verifyToken,
  async (req, res) => {
    try {
      const publicAddress = req.params.publicAddress;
      const user = await DFrameUser.findOne({ publicAddress });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const weeks = [];
      const totalWeeks = 4;

      for (let i = totalWeeks - 1; i >= 0; i--) {
        const start = new Date();
        start.setDate(start.getDate() - i * 7);

        const end = new Date();
        if (i === totalWeeks - 1) {
          end.setDate(end.getDate()); // If it's the current week, use the current date
        } else {
          end.setDate(end.getDate() - (i - 1) * 7); // Else, it's 7 days before
        }

        const startStr = start.toLocaleDateString('en-GB');
        const endStr = end.toLocaleDateString('en-GB');

        const weekData = {
          week: `Week ${totalWeeks - i}`,
          browserData: 0,
          ads: 0,
          survey: 0,
          referral: 0,
        };

        for (const entry of user.rewards.daily) {
          if (entry.date >= startStr && entry.date <= endStr) {
            weekData.browserData += entry.browserData.reduce(
              (acc, e) => acc + e.rewards,
              0
            );
            weekData.ads += entry.ad.reduce((acc, e) => acc + e.rewards, 0);
            weekData.survey += entry.survey.reduce(
              (acc, e) => acc + e.rewards,
              0
            );
            weekData.referral += entry.referral.reduce(
              (acc, e) => acc + e.rewards,
              0
            );
          }
        }

        weeks.push(weekData);
      }

      res.status(200).json(weeks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
);

router.get(
  '/api/rewards/monthly/:publicAddress',
  verifyToken,
  async (req, res) => {
    try {
      const publicAddress = req.params.publicAddress;
      const user = await DFrameUser.findOne({ publicAddress });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const currentMonth = new Date().toLocaleDateString('en-GB', {
        month: 'short',
      });

      const monthlyData = [];
      const currentMonthIndex = new Date().getMonth();
      const year = new Date().getFullYear();

      for (let i = 0; i <= currentMonthIndex; i++) {
        const month = i;
        const monthData = {
          month: new Date(year, i, 1).toLocaleDateString('en-GB', {
            month: 'short',
          }),
          browserData: 0,
          ads: 0,
          survey: 0,
          referral: 0,
        };

        const monthEntries = user.rewards.daily.filter((entry) => {
          const dateParts = entry.date.split('/');
          const entryYear = Number(dateParts[2]);
          const entryMonth = Number(dateParts[1]);
          return entryYear === year && entryMonth === month + 1; // Months are 0-indexed
        });

        monthEntries.forEach((entry) => {
          monthData.browserData += entry.browserData.reduce(
            (acc, e) => acc + e.rewards,
            0
          );
          monthData.ads += entry.ad.reduce((acc, e) => acc + e.rewards, 0);
          monthData.survey += entry.survey.reduce(
            (acc, e) => acc + e.rewards,
            0
          );
          monthData.referral += entry.referral.reduce(
            (acc, e) => acc + e.rewards,
            0
          );
        });

        monthlyData.push(monthData);
      }

      res.status(200).json(monthlyData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
);


module.exports = router;
module.exports.RewardsRouter = router;
