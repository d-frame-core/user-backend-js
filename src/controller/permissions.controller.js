/** @format */
const express = require('express');
const { DFrameUser } = require('../models/user.model'); // Replace with the correct import path for your model
require('dotenv').config();

async function updatePermissionsFunction(req, res) {
  const publicAddress = req.params.publicAddress;
  const { browserData, storageOption } = req.body; // Only accept browserData and storageOption

  try {
    // Find the user by public address
    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update permissions
    user.permissions = user.permissions || {};
    user.permissions.browserData = browserData;
    user.permissions.storageOption = storageOption;

    // Save the updated user
    await user.save();
    console.log('/api/permissions/:publicAddress PATCH CALLED SUCCESSFULLY');
    // Return the updated user
    return res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = { updatePermissionsFunction };
