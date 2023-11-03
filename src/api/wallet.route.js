/** @format */
const express = require('express');
const verifyToken = require('../middleware/middleware');
require('dotenv').config();
const Web3 = require('web3');
const router = express.Router();
router.get('/wallet-data/:publicAddress', verifyToken, async (req, res) => {
  try {
    const userWalletAddress = req.params.publicAddress;
    const web3 = new Web3(process.env.ALCHEMY_RPC);

    // Function to fetch past transactions
    const getPastTransactions = async (_walletAddress) => {
      const dframeContract = new web3.eth.Contract(dframeABI, dframeAddress);

      const transferFromEvents = await dframeContract.getPastEvents(
        'Transfer',
        {
          fromBlock: 0,
          toBlock: 'latest',
          filter: { from: _walletAddress },
        }
      );

      const eventFromPromises = transferFromEvents.map(async (event) => {
        const block = await web3.eth.getBlock(event.blockNumber);
        return {
          ...event,
          timestamp: block.timestamp,
        };
      });

      const eventsFromWithTimestamps = await Promise.all(eventFromPromises);

      const transferToEvents = await dframeContract.getPastEvents('Transfer', {
        fromBlock: 0,
        toBlock: 'latest',
        filter: { to: _walletAddress },
      });

      const eventToPromises = transferToEvents.map(async (event) => {
        const block = await web3.eth.getBlock(event.blockNumber);
        return {
          ...event,
          timestamp: block.timestamp,
        };
      });

      const eventsToWithTimestamps = await Promise.all(eventToPromises);

      const allEvents = [
        ...eventsFromWithTimestamps,
        ...eventsToWithTimestamps,
      ];

      const sortedEvents = allEvents.sort((a, b) => b.timestamp - a.timestamp);

      return sortedEvents;
    };

    // Function to fetch balance
    const getBalance = async (_walletAddress) => {
      const dframeContract = new web3.eth.Contract(dframeABI, dframeAddress);

      const balance = await dframeContract.methods
        .balanceOf(_walletAddress)
        .call();
      const balanceInEth = web3.utils.fromWei(balance, 'ether');
      const balanceInKFormat = Math.trunc(balanceInEth / 1000).toString() + 'k';

      return balanceInKFormat;
    };

    const pastTransactions = await getPastTransactions(userWalletAddress);
    const balance = await getBalance(userWalletAddress);

    const walletData = {
      balance: balance,
      events: pastTransactions,
    };

    res.json(walletData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
module.exports.WalletRouter = router;
