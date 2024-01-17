/** @format */

const express = require('express');
const { DFrameUser } = require('../models/user.model'); // Replace with the correct import path for your model
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const { WebsiteData } = require('../models/websites.model');
const { AdModel } = require('../models/ad.models');
const Survey = require('../models/survey.model');
const storageClient = new Storage({
  keyFilename: path.join(__dirname, '..', '..', 'key.json'),
  projectId: 'user-backend-402016',
});
const bucketName = 'dframe-user-backend'; // Replace with your bucket name
// Controller function for GET /api/user/:publicAddress
async function getUserByPublicAddress(req, res) {
  try {
    const publicAddress = req.params.publicAddress;

    let user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      user = new DFrameUser({
        publicAddress: publicAddress,
        // Add other default fields as needed
      });

      await user.save();
    }

    const jwtPayload = {
      userId: user._id,
      // Include any other user-related data here
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }

    const token = jwt.sign(jwtPayload, jwtSecret);
    console.log('GET USER CALLED');
    res.status(200).json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function deleteUserByPublicAddress(req, res) {
  try {
    const publicAddress = req.params.publicAddress;

    const deletedUser = await DFrameUser.findOneAndDelete({ publicAddress });

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Logging the route and method
    console.log('Route: /api/user/:publicAddress');
    console.log('Method: DELETE');

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

// async function getLatestAd(req, res) {
//   const publicAddress = req.params.publicAddress;

//   try {
//     const user = await DFrameUser.findOne({ publicAddress });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const latestAd = user.userAds[0].ads
//       .filter((ad) => ad.status.toUpperCase() === 'UNSEEN')
//       .reduce((latest, ad) => {
//         if (latest === null || ad.date > latest.date) {
//           return ad;
//         }
//         return latest;
//       }, null);

//     if (latestAd) {
//       return res.status(200).json({ latestAdId: latestAd.adsId });
//     } else {
//       return res.status(404).json({ message: 'No unseen ads found' });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Internal Server Error' });
//   }
// }

async function getLatestAd(req, res) {
  // const publicAddress = req.params.publicAddress;
  // try {
  //   const user = await DFrameUser.findOne({ publicAddress });
  //   if (!user) {
  //     return res.status(404).json({ message: 'User not found' });
  //   }
  //   const latestAd = user.userAds[0].ads
  //     .filter((ad) => ad.status.toUpperCase() === 'UNSEEN')
  //     .map(async (ad) => {
  //       const adDetails = await AdModel.findOne({
  //         _id: ad.adsId,
  //         status: 'VERIFIED',
  //       });
  //       return adDetails ? { ...ad, date: adDetails.date } : null;
  //     })
  //     .reduce((latest, ad) => {
  //       if (ad !== null && (latest === null || ad.date > latest.date)) {
  //         return ad;
  //       }
  //       return latest;
  //     }, null);
  //   if (latestAd) {
  //     return res.status(200).json({ latestAdId: latestAd.adsId });
  //   } else {
  //     return res
  //       .status(404)
  //       .send(null)
  //   }
  // } catch (error) {
  //   console.error(error);
  //   return res.status(500).json({ message: 'Internal Server Error' });
  // }
}

// async function getUnseenSurveys(req, res) {
//   try {
//     const publicAddress = req.params.publicAddress;

//     const today = new Date().toLocaleDateString('en-GB');
//     const user = await DFrameUser.findOne({ publicAddress });

//     if (!user) {
//       return res.json(null); // If user not found, return null
//     }

//     // Filter user's surveys for today that have status 'UNSEEN'
//     const todaysSurveys = user.userSurvey.find(
//       (survey) => survey.date === today
//     );

//     if (!todaysSurveys) {
//       return res.json([]); // If no surveys found for today, return an empty array
//     }

//     // Filter surveys with 'UNSEEN' status from today's surveys
//     const unseenSurveys = todaysSurveys.surveys
//       .filter((survey) => survey.status === 'UNSEEN')
//       .map((survey) => survey.surveyId);

//     if (unseenSurveys.length === 0) {
//       return res.json(null); // If no unseen surveys found, return null
//     }

//     return res.json(unseenSurveys);
//   } catch (error) {
//     return res.status(500).json({ error: 'Server error' });
//   }
// }
async function getUnseenSurveys(req, res) {
  try {
    const publicAddress = req.params.publicAddress;

    const today = new Date().toLocaleDateString('en-GB');
    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.json(null); // If user not found, return null
    }

    // Filter user's surveys for today that have status 'UNSEEN'
    const todaysSurveys = user.userSurvey.find(
      (survey) => survey.date === today
    );

    if (!todaysSurveys) {
      return res.json([]); // If no surveys found for today, return an empty array
    }

    // Fetch survey details for 'UNSEEN' surveys with 'VERIFIED' statusCampaign
    const unseenSurveys = await Promise.all(
      todaysSurveys.surveys
        .filter((survey) => survey.status === 'UNSEEN')
        .map(async (survey) => {
          const surveyDetails = await Survey.findOne({
            _id: survey.surveyId,
            statusCampaign: 'VERIFIED',
          });
          console.log(surveyDetails);
          return surveyDetails ? surveyDetails._id : null;
        })
    );

    // Remove null values from the array (surveys without 'VERIFIED' statusCampaign)
    const filteredUnseenSurveys = unseenSurveys.filter(
      (survey) => survey !== null
    );

    if (filteredUnseenSurveys.length === 0) {
      return res.json(null); // If no unseen surveys with 'VERIFIED' statusCampaign found, return null
    }

    return res.json(filteredUnseenSurveys);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}

// async function getUnseenAdIds(req, res) {
//   try {
//     const publicAddress = req.params.publicAddress;

//     const today = new Date().toLocaleDateString('en-GB');
//     const user = await DFrameUser.findOne({ publicAddress });

//     if (!user) {
//       return res.json(null); // If user not found, return null
//     }

//     // Filter user's surveys for today that have status 'UNSEEN'
//     const todaysAds = user.userAds.find((ad) => ad.date === today);

//     if (!todaysAds) {
//       return res.json([]); // If no surveys found for today, return an empty array
//     }

//     // Fetch survey details for 'UNSEEN' surveys with 'VERIFIED' statusCampaign
//     const unseenAds = await Promise.all(
//       todaysAds.ads
//         .filter((ad) => ad.status === 'UNSEEN')
//         .map(async (ad) => {
//           const adDetails = await AdModel.findOne({
//             _id: ad.adsId,
//             status: 'VERIFIED',
//           });
//           return adDetails ? adDetails._id : null;
//         })
//     );

//     // Remove null values from the array (surveys without 'VERIFIED' statusCampaign)
//     const filteredUnseenAds = unseenAds.filter((ad) => ad !== null);

//     if (filteredUnseenAds.length === 0) {
//       return res.json(null); // If no unseen surveys with 'VERIFIED' statusCampaign found, return null
//     }

//     return res.json(filteredUnseenAds);
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: 'Server error' });
//   }
// }
async function getUnseenAdIds(req, res) {
  try {
    const publicAddress = req.params.publicAddress;

    const today = new Date().toLocaleDateString('en-GB');
    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.json({ latestAdId: null }); // If user not found, return null
    }

    // Filter user's surveys for today that have status 'UNSEEN'
    const todaysAds = user.userAds.find((ad) => ad.date === today);

    if (!todaysAds) {
      return res.json({ latestAdId: null }); // If no surveys found for today, return null
    }

    // Fetch survey details for 'UNSEEN' surveys with 'VERIFIED' statusCampaign
    const unseenAds = await Promise.all(
      todaysAds.ads
        .filter((ad) => ad.status === 'UNSEEN')
        .map(async (ad) => {
          const adDetails = await AdModel.findOne({
            _id: ad.adsId,
            status: 'VERIFIED',
          });
          return adDetails ? adDetails._id : null;
        })
    );

    // Remove null values from the array (surveys without 'VERIFIED' statusCampaign)
    const filteredUnseenAds = unseenAds.filter((ad) => ad !== null);

    if (filteredUnseenAds.length === 0) {
      return res.json({ latestAdId: null }); // If no unseen surveys with 'VERIFIED' statusCampaign found, return null
    }

    const latestAdId = filteredUnseenAds[filteredUnseenAds.length - 1];

    return res.json({ latestAdId });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function uploadProfileImage(req, res) {
  const { publicAddress } = req.params;

  try {
    // Check if the user with the given publicAddress exists and fetch their document
    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.file.buffer) {
      const bucket = storageClient.bucket(bucketName);
      const filename = `${publicAddress}-profileImage-${Date.now()}-${req.file.originalname.replace(
        / /g,
        '_'
      )}`;
      const file = bucket.file(filename);
      const blobStream = file.createWriteStream();

      blobStream.on('error', (err) => {
        console.log('Error in GCP:', err);
        return res.status(500).json({ error: 'Error uploading image to GCS' });
      });

      blobStream.on('finish', async () => {
        // Set the user's profileImage field to the GCS image URL
        user.profileImage = `https://storage.googleapis.com/${bucketName}/${filename}`;

        // Save the updated user document
        await user.save();

        res.status(200).json({
          message: 'Image uploaded successfully',
          imageUrl: user.profileImage,
        });
      });

      blobStream.end(req.file.buffer);
    } else {
      console.log('REQ.FILE.Buffer DOES NOT EXIST');
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateReferralCode(req, res) {
  const { publicAddress } = req.params;
  const { referralCode } = req.body;

  try {
    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the referralCode
    user.referralCode = referralCode;

    // Save the updated user
    await user.save();
    console.log('/api/referral/:publicAddress PATCH CALLED SUCCESSFULLY');

    // Return the updated user
    return res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function getTopVisitedSitesForPast7Days(req, res) {
  const { publicAddress } = req.params;

  try {
    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const websiteVisitCounts = new Map();

    user.userData.forEach((data) => {
      const dataDateComponents = data.dataDate.split('/'); // Split the date string
      // Extracting day, month, and year components
      const day = parseInt(dataDateComponents[0], 10);
      const month = parseInt(dataDateComponents[1], 10) - 1; // Zero-based index
      const year = parseInt(dataDateComponents[2], 10);

      const formattedDate = new Date(Date.UTC(year, month, day, 0, 0, 0)); // UTC date
      console.log('formattedDate', formattedDate);

      if (
        formattedDate >= sevenDaysAgo &&
        data.urlData &&
        data.urlData.length > 0
      ) {
        data.urlData.forEach((urlData) => {
          const urlLink = urlData.urlLink.trim();
          const visitCount = urlData.timestamps.length;

          if (!websiteVisitCounts.has(urlLink)) {
            websiteVisitCounts.set(urlLink, 0);
          }

          websiteVisitCounts.set(
            urlLink,
            websiteVisitCounts.get(urlLink) + visitCount
          );
        });
      }
    });

    const topVisitedWebsites = Array.from(
      websiteVisitCounts,
      ([website, visits]) => ({ name: website, visits })
    );

    topVisitedWebsites.sort((a, b) => b.visits - a.visits);

    console.log('/api/update-websites GET CALLED SUCCESSFULLY');

    const result =
      topVisitedWebsites.length <= 3
        ? topVisitedWebsites
        : topVisitedWebsites.slice(0, 3);

    for (entry in result) {
      const { name } = result[entry];
      const website = await WebsiteData.findOne({ website: name });
      console.log(name);
      if (website && website.tags && website.tags.length > 0) {
        if (!user.tags) {
          user.tags = {};
        }

        if (!user.tags.dataTags) {
          user.tags.dataTags = [];
        }
        user.tags.dataTags = user.tags.dataTags.concat(website.tags);

        await user.save();
      }
    }
    res.status(200).json({ message: 'Updated tags', data: user.tags });
  } catch (error) {
    console.error('Error retrieving top visited websites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getUserByPublicAddress,
  deleteUserByPublicAddress,
  getLatestAd,
  getUnseenSurveys,
  uploadProfileImage,
  updateReferralCode,
  getTopVisitedSitesForPast7Days,
  getUnseenAdIds,
};
