/** @format */
const express = require('express');
const { DFrameUser } = require('../models/user.model'); // Replace with the correct import path for your model
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

async function updateAdStatus(req, res) {
  console.log('Entered Update Ad Status');
  const publicAddress = req.params.publicAddress;
  const adId = req.params.adId;

  try {
    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const today = new Date().toLocaleDateString('en-GB');

    // Find the userAds entry for today
    const todayAdsEntry = user.userAds.find(
      (adsEntry) => adsEntry.date === today
    );

    if (!todayAdsEntry) {
      return res.status(404).json({ message: 'No ads found for today' });
    }

    // Find the ad with the specified adId in the userAds for today
    const adToUpdate = todayAdsEntry.ads.find((ad) => ad.adsId === adId);

    if (!adToUpdate) {
      return res
        .status(404)
        .json({ message: 'Ad not found for the user for today' });
    }

    // Check if the ad status is 'UNSEEN' and update it to 'SEEN'
    if (adToUpdate.status.toUpperCase() === 'UNSEEN') {
      adToUpdate.status = 'SEEN';
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
      return res.status(400).json({ message: 'Ad status is not UNSEEN' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = { updateAdStatus };
