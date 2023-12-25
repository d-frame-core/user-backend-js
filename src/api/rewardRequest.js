/** @format */

const express = require('express');
const router = express.Router();

const {
  createRewardRequest,
  getAllRewardRequests,
  getRewardRequestByPublicAddress,
  updateRewardRequestStatus,
  deleteRewardRequest,
  getRewardHistoryByPublicAddress,
  getRewardsForPublicAddress,
} = require('../controller/reward.controller');

// Create a reward request
router.post('/rewardRequests/create', createRewardRequest);

// Get all reward requests
router.get('/rewardRequests/getAll', getAllRewardRequests);

// Get a single reward request by publicAddress
router.get(
  '/rewardRequests/getSingle/:publicAddress',
  getRewardRequestByPublicAddress
);

// get history by public address
router.get('/history/:publicAddress', getRewardHistoryByPublicAddress);

// get pending rewards by public address
router.get('/pending/:publicAddress', getRewardsForPublicAddress);

// Update status of a reward request by publicAddress
router.put('/rewardRequests/status/:publicAddress/', updateRewardRequestStatus);

// Delete a reward request by publicAddress
router.delete('/rewardRequests/delete/:publicAddress', deleteRewardRequest);

module.exports = router;
module.exports.RewardRequestRouter = router;
