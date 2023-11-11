/** @format */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Assuming you have your models defined (DFrameUser and Transaction)
const DFrameUser = require('../models/user.model').DFrameUser;
const Transaction = require('../models/transaction.model').Transaction;

// Define your route
router.get('/api/dummy/:id', async (req, res) => {
  try {
    // Assuming :id is the user's ID
    const userId = req.params.id;

    // Create an array to store transaction IDs
    const transactionIds = [];

    // Add 5 dummy transactions FROM the user
    for (let i = 0; i < 5; i++) {
      const dummyTransaction = new Transaction({
        from: userId,
        to: new mongoose.Types.ObjectId(), // Replace with the actual user ID or logic
        amount: Math.floor(Math.random() * 100) + 1, // Replace with the actual amount or logic
        createdAt: new Date().toLocaleDateString('en-GB'),
        updatedAt: new Date().toLocaleDateString('en-GB'),
      });

      const savedTransaction = await dummyTransaction.save();
      transactionIds.push(savedTransaction._id);
    }

    // Add 5 dummy transactions TO the user
    for (let i = 0; i < 5; i++) {
      const dummyTransaction = new Transaction({
        from: new mongoose.Types.ObjectId(), // Replace with the actual user ID or logic
        to: userId,
        amount: Math.floor(Math.random() * 100) + 1, // Replace with the actual amount or logic
        createdAt: new Date().toLocaleDateString('en-GB'),
        updatedAt: new Date().toLocaleDateString('en-GB'),
      });

      const savedTransaction = await dummyTransaction.save();
      transactionIds.push(savedTransaction._id);
    }

    // Update the user's saleHistory with the transaction IDs
    await DFrameUser.updateOne(
      { _id: userId },
      { $push: { 'dftForSale.saleHistory': { $each: transactionIds } } }
    );

    // Send a response
    res.status(200).json({ message: 'Dummy transactions added successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Export the router
module.exports.DUMMYROUTER = router;
