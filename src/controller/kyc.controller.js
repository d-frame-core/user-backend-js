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
const storageClient = new Storage({
  keyFilename: path.join(__dirname, '..', '..', 'key.json'),
  projectId: 'user-backend-402016',
});
const bucketName = 'dframe-user-backend'; // Replace with your bucket name
const { KYCStatus } = require('../models/user.model'); // Make sure to import KYCStatus properly
async function updateKYC1Details(req, res) {
  try {
    const publicAddress = req.params.publicAddress;
    const { firstName, lastName, userName, phoneNumber, email } = req.body;

    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.kyc1 = user.kyc1 ?? {};
    user.kyc1.details = user.kyc1.details ?? {};

    user.kyc1.details.firstName = firstName;
    user.kyc1.details.lastName = lastName;
    user.kyc1.details.userName = userName;
    user.kyc1.details.phoneNumber = phoneNumber;
    user.kyc1.details.email = email;

    user.kyc1.status = KYCStatus.UNVERIFIED;

    user.rewards = user.rewards || {};
    user.rewards.oneTime = user.rewards.oneTime || {};

    const kyc1Reward = {
      refId: new mongoose.Types.ObjectId(),
      rewards: 1,
      date: new Date().toLocaleDateString('en-GB'),
      status: 'UNPAID',
      timestamp: new Date(),
    };
    user.rewards.oneTime.kyc1 = kyc1Reward;

    await user.save();

    // Logging the route and method
    console.log('Route: /api/kyc1/:publicAddress');
    console.log('Method: PATCH');

    return res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
async function updateKYC2Details(req, res) {
  try {
    const publicAddress = req.params.publicAddress;
    const {
      gender,
      country,
      state,
      city,
      street,
      doorno,
      pincode,
      dob,
      annualIncome,
    } = req.body;

    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.kyc2 = user.kyc2 ?? {};
    user.kyc2.details = user.kyc2.details ?? {};

    user.kyc2.details.gender = gender;
    user.kyc2.details.country = country;
    user.kyc2.details.state = state;
    user.kyc2.details.city = city;
    user.kyc2.details.street = street;
    user.kyc2.details.doorno = doorno;
    user.kyc2.details.pincode = pincode;
    user.kyc2.details.dob = dob;
    user.kyc2.details.annualIncome = annualIncome;

    user.kyc2.status = KYCStatus.UNVERIFIED;

    user.rewards = user.rewards || {};
    user.rewards.oneTime = user.rewards.oneTime || {};

    const kyc2Reward = {
      refId: new mongoose.Types.ObjectId(),
      rewards: 1,
      date: new Date().toLocaleDateString('en-GB'),
      status: 'UNPAID',
      timestamp: new Date(),
    };
    user.rewards.oneTime.kyc2 = kyc2Reward;

    await user.save();

    // Logging the route and method
    console.log('Route: /api/kyc2/:publicAddress');
    console.log('Method: PATCH');

    return res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function uploadKYC3Images(req, res) {
  try {
    let uploadedCount = 0;
    const { publicAddress } = req.params;

    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const uploadImage = async (fieldName, fieldKey) => {
      if (req.files[fieldName]) {
        const bucket = storageClient.bucket(bucketName);
        const file = req.files[fieldName][0];
        const filename = `${publicAddress}-${fieldKey}-${Date.now()}-${file.originalname.replace(
          / /g,
          '_'
        )}`;
        const blobStream = bucket.file(filename).createWriteStream();

        blobStream.on('error', (err) => {
          console.log(`Error uploading ${fieldKey} to GCS`, err);
          return res
            .status(500)
            .json({ error: `Error uploading ${fieldKey} to GCS` });
        });

        blobStream.on('finish', async () => {
          user.kyc3[
            fieldKey
          ] = `https://storage.googleapis.com/${bucketName}/${filename}`;

          uploadedCount++;

          if (uploadedCount === 3) {
            user.kyc3.status = KYCStatus.UNVERIFIED;

            user.rewards = user.rewards || {};
            user.rewards.oneTime = user.rewards.oneTime || {};

            const kyc3Reward = {
              refId: new mongoose.Types.ObjectId(),
              rewards: 1,
              date: new Date().toLocaleDateString('en-GB'),
              status: 'UNPAID',
              timestamp: new Date(),
            };
            user.rewards.oneTime.kyc3 = kyc3Reward;

            await user.save();
            res
              .status(200)
              .json({ message: 'All images uploaded successfully' });
          }
        });

        blobStream.end(file.buffer);
      } else {
        return res
          .status(400)
          .json({ message: `No ${fieldKey} file provided` });
      }
    };

    await Promise.all([
      uploadImage('idProof', 'idProof'),
      uploadImage('addressProof', 'addressProof'),
      uploadImage('userPhoto', 'userPhoto'),
    ]);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
module.exports = {
  updateKYC1Details,
  updateKYC2Details,
  uploadKYC3Images,
};
