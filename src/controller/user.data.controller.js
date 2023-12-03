/** @format */
const express = require('express');
const { DFrameUser } = require('../models/user.model'); // Replace with the correct import path for your model
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();
const ipfsAPI = require('ipfs-api');
const crypto = require('crypto');
const { WebsiteData } = require('../models/websites.model');
const ipfs = ipfsAPI('127.0.0.1', '5001');
const IV = '5183666c72eec9e4';

async function getTopVisitedSites(req, res) {
  const { publicAddress } = req.params;

  try {
    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const websiteVisitCounts = new Map();

    user.userData.forEach((data) => {
      if (data.urlData) {
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

    console.log(
      '/api/user-data/top-sites/:publicAddress GET CALLED SUCCESSFULLY'
    );

    const result =
      topVisitedWebsites.length <= 5
        ? topVisitedWebsites
        : topVisitedWebsites.slice(0, 5);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error retrieving top visited websites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getTopTimespentSites(req, res) {
  const { publicAddress } = req.params;

  try {
    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const websiteTimespentSum = new Map();

    user.userData.forEach((data) => {
      if (data.urlData) {
        data.urlData.forEach((urlData) => {
          const urlLink = urlData.urlLink.trim();
          const timespentSum = urlData.timespent.reduce(
            (total, time) => total + time,
            0
          );

          if (!websiteTimespentSum.has(urlLink)) {
            websiteTimespentSum.set(urlLink, 0);
          }

          websiteTimespentSum.set(
            urlLink,
            websiteTimespentSum.get(urlLink) + timespentSum
          );
        });
      }
    });

    const topTimespentWebsites = Array.from(
      websiteTimespentSum,
      ([website, timespentSum]) => ({ name: website, time: timespentSum })
    );
    topTimespentWebsites.sort((a, b) => b.time - a.time);

    const top5TimespentWebsites = topTimespentWebsites.slice(0, 5);

    console.log(
      '/api/user-data/top-times/:publicAddress GET CALLED SUCCESSFULLY'
    );
    res.status(200).json(top5TimespentWebsites);
  } catch (error) {
    console.error('Error retrieving top timespent websites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteUserData(req, res) {
  const { publicAddress } = req.params;

  try {
    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Optionally, you can clear the userData for the user
    user.userData = [];

    await user.save();
    console.log('/api/user-data/:publicAddress DELETE CALLED SUCCESSFULLY');
    res.status(200).json({ message: 'User data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function decryptData(encryptedData, encryptionKey) {
  const encryptedBuffer = Buffer.from(encryptedData, 'base64'); // Convert base64 data to a buffer
  const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, IV);
  let decrypted = decipher.update(encryptedBuffer, 'base64', 'utf8'); // Use 'utf8' encoding for both input and output
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function fetchIPFSData(cid) {
  try {
    console.log('FETCHING IPFS DATA');
    const result = await ipfs.files.get(cid);
    console.log('RESULT:', result);
    if (result.length > 0) {
      const data = result[0].content.toString();
      console.log('DATA of result ', data);
      return data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching data from IPFS:', error);
    return null;
  }
}

async function getUserData(req, res) {
  const { publicAddress } = req.params;

  try {
    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Uncomment the section to handle additional data retrieval methods
    const gcpData = user.userData;
    let ipfsData = [];
    for (const cid of user.cid) {
      console.log('ENTERED CID', cid);
      const ipfsEncryptedData = await fetchIPFSData(cid);
      if (ipfsEncryptedData) {
        console.log('ENTERED IF', ipfsEncryptedData);
        const key = crypto
          .createHash('sha256')
          .update(user.publicAddress)
          .digest();
        const decryptedData = decryptData(ipfsEncryptedData, key);
        ipfsData.push(decryptedData); // Assuming data is JSON
      }
    }
    const allUserData = { gcp: gcpData, ipfs: ipfsData };

    // const allUserData = user.userData; 

    console.log('/api/user-data/:publicAddress GET CALLED SUCCESSFULLY');
    res.status(200).json(allUserData);
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUserDataByTags(req, res) {
  const { publicAddress } = req.params;
  const { tags } = req.body;

  try {
    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create an array to store matching websites
    const matchingWebsites = [];

    // Iterate through the user's data to find websites with matching tags
    user.userData.forEach((data) => {
      if (data.urlData) {
        data.urlData.forEach((urlData) => {
          const urlLink = urlData.urlLink.trim();
          const urlTags = urlData.tags;

          // Check if any of the tags match the provided tags
          if (tags.some((tag) => urlTags.includes(tag))) {
            matchingWebsites.push({ urlLink, tags: urlTags });
          }
        });
      }
    });

    console.log('/api/user-data/tags/:publicAddress GET CALLED SUCCESSFULLY');
    res.status(200).json(matchingWebsites);
  } catch (error) {
    console.error('Error retrieving matching websites by tags:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function storeBrowserData(req, res) {
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
    // if (user.permissions.storageOption == 'GCP') {
    console.log('GCP ENTERED');
    if (dataEntries.length < 1) {
      return res.status(200).send('No data entries found');
    }
    for (const entry of dataEntries) {
      const { urlLink, properties } = entry;
      const { timeStamp, time_on_site } = properties;

      // Convert the received timestamp to localeTimeString('en-GB')
      const localeTimeString = new Date(timeStamp).toLocaleTimeString('en-GB');

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

    // } else {
    //   console.log('ENTERED ELSE');
    //   const key = crypto
    //     .createHash('sha256')
    //     .update(req.params.publicAddress)
    //     .digest();
    //   console.log('reached key', key);
    //   const cipher = crypto.createCipheriv('aes-256-cbc', key, IV);
    //   console.log('reached cipher', cipher);
    //   const preDataBuffer = Buffer.from(JSON.stringify(dataEntries));
    //   console.log('preDataBuffer', preDataBuffer);
    //   let encryptedData = cipher.update(preDataBuffer, 'utf8', 'base64');
    //   encryptedData += cipher.final('base64');
    //   console.log(encryptedData);
    //   const dataBuffer = Buffer.from(JSON.stringify(encryptedData));
    //   console.log('dataBuffer', dataBuffer);
    //   const result = await ipfs.files.add(dataBuffer);
    //   const hash = result[0].hash;
    //   console.log(hash);
    //   user.cid.push(hash);
    // }

    // const today = new Date().toLocaleDateString('en-GB');
    // user.rewards = user.rewards || {};
    // // Check if daily rewards for today exist, otherwise create it
    // if (!user.rewards.daily || user.rewards.daily.date !== today) {
    //   user.rewards.daily = {
    //     date: today,
    //     status: 'unpaid',
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
}

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
module.exports = {
  getTopVisitedSites,
  getTopTimespentSites,
  deleteUserData,
  getUserData,
  getUserDataByTags,
  storeBrowserData,
};
