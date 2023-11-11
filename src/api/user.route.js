/** @format */

const express = require('express');
const { DFrameUser } = require('../models/user.model'); // Replace with the correct import path for your model
const { KYCStatus } = require('../models/user.model'); // Make sure to import KYCStatus properly
const crypto = require('crypto');
// const ipfsAPI = require('ipfs-api');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const verifyToken = require('../middleware/middleware');
const { Storage } = require('@google-cloud/storage');
const {
  getUserByPublicAddress,
  deleteUserByPublicAddress,
  getLatestAd,
  uploadProfileImage,
  updateReferralCode,
  getUnseenSurveys,
  updateWebsites,
  getTop3URLsForPast7Days,
  getTopVisitedSitesForPast7Days,
  addUserTag,
  deleteUserTag,
} = require('../controller/user.controller');
const {
  updateKYC1Details,
  updateKYC2Details,
  uploadKYC3Images,
} = require('../controller/kyc.controller');
const {
  getTopVisitedSites,
  getTopTimespentSites,
  deleteUserData,
  getUserData,
  getUserDataByTags,
  storeBrowserData,
} = require('../controller/user.data.controller');
const {
  updatePermissionsFunction,
} = require('../controller/permissions.controller');
const { updateAdStatus } = require('../controller/ad.controller');
const { WebsiteData } = require('../models/websites.model');

const router = express.Router();
// const ipfs = ipfsAPI('127.0.0.1', '5001');
const IV = '5183666c72eec9e4';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const jwtSecret = process.env.JWT_SECRET || 'defaultSecret';
console.log(jwtSecret);
if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}
// POST /api/signup/:publicAddress
router.post('/api/signup/:publicAddress', async (req, res) => {
  const { publicAddress } = req.params;

  try {
    // Check if a user with the provided publicAddress already exists
    const existingUser = await DFrameUser.findOne({ publicAddress });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create a new user with only the publicAddress field
    const newUser = new DFrameUser({
      publicAddress,
    });

    // Save the new user to the database
    await newUser.save();
    console.log('Signup CALLED SUCCESFULLY');
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/api/user/:publicAddress', async (req, res) => {
  try {
    const publicAddress = req.params.publicAddress;
    const userData = req.body;

    // Check if the user already exists with the given publicAddress
    const existingUser = await DFrameUser.findOne({ publicAddress });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user based on the provided data
    const newUser = new DFrameUser(userData.user);

    // Save the user to the database
    await newUser.save();

    // Create a JWT token with user information
    const jwtPayload = {
      userId: newUser._id, // Assuming your user model has an "_id" field
    };

    const jwtSecret = process.env.JWT_SECRET; // Ensure you have JWT_SECRET in your environment variables

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }

    // Sign the JWT token
    const token = jwt.sign(jwtPayload, jwtSecret);
    console.log('/api/user/:publicAddress POST CALLED SUCCESFULLY');
    // Return the user details and token in the response
    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/api/user/:publicAddress', getUserByPublicAddress);

// DELETE /api/user/:publicAddress
router.delete('/api/user/:publicAddress', deleteUserByPublicAddress);

// PATCH /api/referral/:publicAddress
router.patch('/api/referral/:publicAddress', verifyToken, updateReferralCode);
// PATCH /api/kyc1/:publicAddress
router.patch('/api/kyc1/:publicAddress', verifyToken, updateKYC1Details);

// PATCH /api/kyc2/:publicAddress
router.patch('/api/kyc2/:publicAddress', verifyToken, updateKYC2Details);

// PATCH /api/permissions/:publicAddress
router.patch('/api/permissions/:publicAddress', updatePermissionsFunction);

// Define the route
router.patch(
  '/api/image/:publicAddress',
  verifyToken,
  upload.single('profile-image'),
  uploadProfileImage
);

// Define the route
router.patch(
  '/api/kyc3/:publicAddress',
  upload.fields([
    { name: 'idProof', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 },
    { name: 'userPhoto', maxCount: 1 },
  ]),
  uploadKYC3Images
);

// Continue with the next part of your code.

// POST /api/user-data/:publicAddress
router.post('/api/user-data/:publicAddress', storeBrowserData);

// DELETE /api/user-data/:publicAddress
router.delete('/api/user-data/:publicAddress', deleteUserData);

// Continue with the next part of your code.
// GET /api/user-data/:publicAddress
router.get('/api/user-data/:publicAddress', verifyToken, getUserData);
router.get(
  '/api/user-data/top-sites/:publicAddress',
  verifyToken,
  getTopVisitedSites
);

// GET /api/user-data/top-times/:publicAddress
router.get(
  '/api/user-data/top-times/:publicAddress',
  verifyToken,
  getTopTimespentSites
);

// GET /api/user-data/tags/:publicAddress
router.get('/api/user-data/tags/:publicAddress', getUserDataByTags);

router.get('/api/user/get-latest-ad/:publicAddress', getLatestAd);

router.post('/api/update-ad-status/:publicAddress/:adId', updateAdStatus);

router.get(
  '/api/get-unseen-surveys/:publicAddress',
  verifyToken,
  getUnseenSurveys
);

router.post(
  '/api/update-websites/:publicAddress',
  getTopVisitedSitesForPast7Days
);

router.post('/api/add-tag/:publicAddress', verifyToken, addUserTag);

router.delete('/api/delete-tag/:publicAddress', verifyToken, deleteUserTag);
router.post('/dummy/ad/:publicAddress', async (req, res) => {
  const { publicAddress } = req.params;
  const adId = '652d5d9bea70db2e89fa13bf'; // Replace this with the actual ad ID

  try {
    const today = new Date().toLocaleDateString('en-GB');
    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if an entry for today exists, create one if not
    const todayAds = user.userAds.find((ad) => ad.date === today);

    if (!todayAds) {
      user.userAds.push({ date: today, ads: [] });
    }

    // Find today's entry and push the new ad with the given ID
    const todayAdsIndex = user.userAds.findIndex((ad) => ad.date === today);
    user.userAds[todayAdsIndex].ads.push({
      adsId: adId,
      rewards: 0, // You can set the rewards as needed
      status: 'UNSEEN',
    });

    await user.save();

    res.status(200).json({ message: 'Ad added successfully for today' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
const UserRouter = router;
module.exports = { UserRouter };
