/** @format */

const express = require('express');
const { DFrameUser } = require('../models/user.model'); // Replace with the correct import path for your model
const { KYCStatus } = require('../models/user.model'); // Make sure to import KYCStatus properly
const crypto = require('crypto');
const ipfsAPI = require('ipfs-api');
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
  getUserDataForPast3Dates,
  getIPFSDataFromCID,
  getIPFSDataForDate,
} = require('../controller/user.data.controller');
const {
  updatePermissionsFunction,
} = require('../controller/permissions.controller');
const { updateAdStatus } = require('../controller/ad.controller');
const { WebsiteData } = require('../models/websites.model');

const router = express.Router();
const ipfs = ipfsAPI('127.0.0.1', '5001');
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
router.patch(
  '/api/permissions/:publicAddress',
  verifyToken,
  updatePermissionsFunction
);

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
router.post('/api/user-data/:publicAddress', async (req, res) => {
  console.log('ENTERED the user-data POST route');
  const { publicAddress } = req.params;
  const dataEntries = req.body.tabData; // Array of data entries

  console.log('User data stored in database is', dataEntries);

  try {
    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Define currentDate in localeDateString('en-GB') format
    const currentDate = new Date().toLocaleDateString('en-GB');

    // Iterate through the array of data entries
    if (user.permissions.storageOption == 'GCP') {
      console.log('GCP ENTERED');
      if (dataEntries.length < 1) {
        return res.status(200).send('No data entries found');
      }
      for (const entry of dataEntries) {
        const { urlLink, properties } = entry;
        const { timeStamp, time_on_site } = properties;

        // Convert the received timestamp to localeTimeString('en-GB')
        const localeTimeString = new Date(timeStamp).toLocaleTimeString(
          'en-GB'
        );

        // Convert time_spent to a number
        const parsedTimeSpent = parseFloat(time_on_site);

        // Check if the user already has userData for the currentDate
        const existingUserData = user.userData.find(
          (data) => data.dataDate === currentDate
        );

        if (existingUserData) {
          // If data for the same date exists, update it
          const existingUrlData = existingUserData.urlData.find(
            (urlData) => urlData.urlLink === urlLink
          );

          if (existingUrlData) {
            // Website already exists, so just push new timestamp and time_spent
            if (!existingUrlData.timestamps.includes(localeTimeString)) {
              existingUrlData.timestamps.push(localeTimeString);
              existingUrlData.timespent.push(parsedTimeSpent);
            }
          } else {
            // Website doesn't exist yet, so add a new entry with static tags
            existingUserData.urlData.push({
              urlLink: urlLink,
              timestamps: [localeTimeString],

              timespent: [parsedTimeSpent],
            });
          }
        } else {
          // Add a new entry for the currentDate with an empty timespent array and static tags
          user.userData.push({
            dataDate: currentDate,
            urlData: [
              {
                urlLink: urlLink,
                timestamps: [localeTimeString],

                timespent: [parsedTimeSpent],
              },
            ],
            cid:
              user.userData.find((data) => data.dataDate === currentDate).cid ||
              [],
          });
        }

        const website = await WebsiteData.findOne({ website: urlLink });
        if (website) {
          // Website exists, update visitor count and user ID
          website.visitorCounts++;
          if (!website.userId.includes(user._id)) {
            website.userId.push(user._id);
          }
          await website.save();
        } else {
          // If the URL doesn't exist in the WebsiteData model, create a new entry
          const newWebsite = new WebsiteData({
            website: urlLink,
            visitorCounts: 1,
            userId: [user._id],
          });
          await newWebsite.save();
        }
      }
    } else {
      // console.log('ENTERED ELSE');
      // const key = crypto
      //   .createHash('sha256')
      //   .update(req.params.publicAddress)
      //   .digest();
      // const cipher = crypto.createCipheriv('aes-256-cbc', key, IV);
      // const preDataBuffer = Buffer.from(JSON.stringify(dataEntries));
      // let encryptedData = cipher.update(preDataBuffer, 'utf8', 'base64');
      // encryptedData += cipher.final('base64');
      // const dataBuffer = Buffer.from(JSON.stringify(encryptedData));
      // const result = await ipfs.files.add(dataBuffer);
      // const hash = result[0].hash;
      // console.log('cid is created for this', hash);
      // user.cid.push(hash);

      /**
       * NEW SOLUTION
       */
      console.log('ENTERED ELSE');
      const key = crypto
        .createHash('sha256')
        .update(req.params.publicAddress)
        .digest();
      const cipher = crypto.createCipheriv('aes-256-cbc', key, IV);

      // Initialize a new array to store website data
      const modifiedDataArray = [];

      // Applying time spent and timestamp conversion for each website
      for (const entry of dataEntries) {
        const { urlLink, properties } = entry;
        const { timeStamp, time_on_site } = properties;
        const localeTimeString = new Date(timeStamp).toLocaleTimeString(
          'en-GB'
        );
        const parsedTimeSpent = parseFloat(time_on_site);
        modifiedDataArray.push({ urlLink, localeTimeString, parsedTimeSpent });
      }

      const preDataBuffer = Buffer.from(JSON.stringify(modifiedDataArray));
      let encryptedData = cipher.update(preDataBuffer, 'utf8', 'base64');
      encryptedData += cipher.final('base64');
      const dataBuffer = Buffer.from(JSON.stringify(encryptedData));
      const result = await ipfs.files.add(dataBuffer);
      const hash = result[0].hash;
      console.log('cid is created for this', hash);
      const existingUserData = user.userData.find(
        (data) => data.dataDate === currentDate
      );
      if (existingUserData) {
        existingUserData.cid.push(hash);
      } else {
        user.userData.push({
          dataDate: currentDate,
          // urlData:
          //   user.userData.find((data) => data.dataDate === currentDate)
          //     .urlData || [],
          cid: [hash],
        });
      }
    }

    // const today = new Date().toLocaleDateString('en-GB');
    // user.rewards = user.rewards || {};
    // // Check if daily rewards for today exist, otherwise create it
    // if (!user.rewards.daily || user.rewards.daily.date !== today) {
    //   user.rewards.daily = {
    //     date: today,
    //     status: 'unpaid',`
    //     browserData: [],
    //   };
    // }

    // // Add reward for browserData
    // user.rewards.daily.browserData.push({
    //   rewards: 1,
    //   timestamp: new Date().toISOString(), // Set timestamp to current time

    // });

    // const today = new Date().toLocaleDateString('en-GB');
    // user.rewards = user.rewards || {};
    // // Check if daily rewards for today exist, otherwise create it
    // if (!user.rewards.daily || user.rewards.daily.date !== today) {
    //   user.rewards.daily = {
    //     date: today,
    //     status: 'unpaid',
    //     browserData: {
    //       refId: new mongoose.Types.ObjectId(), // Generate a random ObjectId for browserData
    //       rewards: [],
    //       timestamp: [],
    //     },
    //     ad: {
    //       refId: new mongoose.Types.ObjectId(), // Generate a random ObjectId for ad
    //       rewards: [],
    //       timestamp: [],
    //     },
    //     survey: {
    //       refId: new mongoose.Types.ObjectId(), // Generate a random ObjectId for survey
    //       rewards: [],
    //       timestamp: [],
    //     },
    //     referral: {
    //       refId: new mongoose.Types.ObjectId(), // Generate a random ObjectId for referral
    //       rewards: [],
    //       timestamp: [],
    //     },
    //   };
    // }

    // Add reward for browserData
    // user.rewards.daily.browserData.rewards.push(1);
    // user.rewards.daily.browserData.timestamp.push(new Date().toISOString());

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
    user.rewards.daily[user.rewards.daily.length - 1].browserData.push({
      refId: newRefId,
      rewards: 1,
      timestamp: new Date().toISOString(),
    });
    await user.save();
    console.log('/api/user-data/:publicAddress POST CALLED SUCCESFULLY');
    res.status(200).json(user);
  } catch (error) {
    console.error('Error adding user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// already done in the function
// function encryptData(data, encryptionKey) {
//   const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey);
//   let encrypted = cipher.update(data, 'utf8', 'hex');
//   encrypted += cipher.final('hex');
//   return encrypted;
// }

// function decryptData(encryptedData, encryptionKey) {
//   const encryptedBuffer = Buffer.from(encryptedData, 'base64'); // Convert base64 data to a buffer
//   const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, IV);
//   let decrypted = decipher.update(encryptedBuffer, 'base64', 'utf8'); // Use 'utf8' encoding for both input and output
//   decrypted += decipher.final('utf8');
//   return decrypted;
// }

// async function fetchIPFSData(cid) {
//   try {
//     console.log('FETCHING IPFS DATA');
//     const result = await ipfs.files.get(cid);
//     console.log('RESULT:', result);
//     if (result.length > 0) {
//       const data = result[0].content.toString();
//       console.log('DATA of result ', data);
//       return data;
//     }
//     return null;
//   } catch (error) {
//     console.error('Error fetching data from IPFS:', error);
//     return null;
//   }
// }

// Continue with the next part of your code.
// GET /api/user-data/:publicAddress
router.get('/api/user-data/:publicAddress', getIPFSDataForDate);

router.get('/api/user-data/cid/:publicAddress/:cid', getIPFSDataFromCID);

router.delete('/api/user-data/:publicAddress', deleteUserData);

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

const UserRouter = router;
module.exports = { UserRouter };
