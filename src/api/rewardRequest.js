const express = require('express');
const router = express.Router();
const rewardController = require('./rewardController');

// Create a reward request
router.post('/rewardRequests/create', rewardController.createRewardRequest);

// Get all reward requests
router.get('/rewardRequests/getAll', rewardController.getAllRewardRequests);

// Get a single reward request by publicAddress
router.get('/rewardRequests/getSingle/:publicAddress', rewardController.getRewardRequestByPublicAddress);

// Update status of a reward request by publicAddress
router.put('/rewardRequests/status/:publicAddress/', rewardController.updateRewardRequestStatus);

// Delete a reward request by publicAddress
router.delete('/rewardRequests/delete/:publicAddress', rewardController.deleteRewardRequest);

module.exports = router;
