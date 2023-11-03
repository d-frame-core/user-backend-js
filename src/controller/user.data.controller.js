/** @format */
const express = require('express');
const { DFrameUser } = require('../models/user.model'); // Replace with the correct import path for your model
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

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

async function getUserData(req, res) {
  const { publicAddress } = req.params;

  try {
    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Uncomment the section to handle additional data retrieval methods
    // const gcpData = user.userData;
    // let ipfsData = [];
    // for (const cid of user.cid) {
    //   console.log('ENTERED CID', cid);
    //   const ipfsEncryptedData = await fetchIPFSData(cid);
    //   if (ipfsEncryptedData) {
    //     console.log('ENTERED IF', ipfsEncryptedData);
    //     const key = crypto
    //       .createHash('sha256')
    //       .update(user.publicAddress)
    //       .digest();
    //     const decryptedData = decryptData(ipfsEncryptedData, key);
    //     ipfsData.push(decryptedData); // Assuming data is JSON
    //   }
    // }
    // const allUserData = { gcp: gcpData, ipfs: ipfsData };

    const allUserData = user.userData; // Currently returning only the user data

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
module.exports = {
  getTopVisitedSites,
  getTopTimespentSites,
  deleteUserData,
  getUserData,
  getUserDataByTags,
};
