/** @format */
const express = require('express');
const { DFrameUser } = require('../models/user.model'); // Replace with the correct import path for your model
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

async function updateAdStatus(req, res) {
  const publicAddress = req.params.publicAddress;
  const adId = req.params.adId;

  try {
    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let adToUpdate;
    for (const userAd of user.userAds) {
      adToUpdate = userAd.ads.find((ad) => ad.adsId === adId);
      if (adToUpdate) {
        break; // Break the loop if the ad is found
      }
    }

    if (!adToUpdate) {
      console.log('Ad not found for the user');
      return res.status(404).json({ message: 'Ad not found for the user' });
    }

    // Check if the ad status is 'UNSEEN' and update it to 'SEEN'
    if (adToUpdate.status.toUpperCase() === 'UNSEEN') {
      adToUpdate.status = 'SEEN';
      console.log('ENTERED AD UPDATE STATUS');
      const today = new Date().toLocaleDateString('en-GB');
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
      user.rewards.daily[user.rewards.daily.length - 1].ad.push({
        refId: newRefId,
        rewards: 1,
        timestamp: new Date().toISOString(),
      });
      await user.save();
      console.log(
        '/api/update-ad-status/:publicAddress/:adId POST CALLED SUCCESSFULLY'
      );

      return res.status(200).json({ message: 'Ad status updated to SEEN' });
    } else {
      console.log('Ad status is not UNSEEN');
      return res.status(400).json({ message: 'Ad status is not UNSEEN' });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = { updateAdStatus };
