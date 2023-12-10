/** @format */

const { Transaction } = require('../models/transaction.model');
const { DFrameUser } = require('../models/user.model');

async function createDFTSale(req, res) {
  const { publicAddress } = req.params;
  const { amount, userId } = req.body;

  try {
    let user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.dftForSale) {
      user.dftForSale = {};
    }

    user.dftForSale = {
      amount: Number(amount),
      status: 'UNVERIFIED',
      updatedAt: Date.now(),
      saleHistory: user.dftForSale.saleHistory || [],
    };

    const transaction = new Transaction({
      from: userId,
      status: 'PENDING',
      amount: Number(amount),
      createdAt: Date.now(),
    });
    await transaction.save();

    console.log('CALLED createDFTSale');

    await user.save();

    res.status(200).json({ message: 'DFT for sale created successfully' });
  } catch (error) {
    console.error('Error creating DFT for sale:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateDFTSale(req, res) {
  const { publicAddress } = req.params;
  const { amount } = req.body;

  try {
    let user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.dftForSale) {
      user.dftForSale = {};
    }

    user.dftForSale.amount = Number(amount);
    user.dftForSale.updatedAt = Date.now();

    console.log('UPDATED DFT SALE CALLED');
    await user.save();

    res.status(200).json({ message: 'DFT for sale updated successfully' });
  } catch (error) {
    console.error('Error updating DFT for sale:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteDFTSale(req, res) {
  const { publicAddress } = req.params;

  try {
    let user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.dftForSale) {
      user.dftForSale = {};
    }

    user.dftForSale = {
      amount: 0,
      status: 'UNVERIFIED',
      updatedAt: Date.now(),
      saleHistory: user.dftForSale.saleHistory || [],
    };

    await user.save();

    res.status(200).json({ message: 'DFT for sale deleted successfully' });
  } catch (error) {
    console.error('Error deleting DFT for sale:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
async function pastTransactions(req, res) {
  const { publicAddress } = req.params;

  try {
    const user = await DFrameUser.findOne({ publicAddress });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Extract transaction IDs from the user's saleHistory array
    const transactionIds = user.dftForSale.saleHistory;

    // Fetch all transactions associated with the extracted IDs
    const transactions = await Transaction.find({
      _id: { $in: transactionIds },
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching past transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
module.exports = {
  createDFTSale,
  updateDFTSale,
  deleteDFTSale,
  pastTransactions,
};
