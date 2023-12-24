const RewardRequest = require('../models/reward.model');

// Create operation
async function createRewardRequest(req, res) {
  try {
    const { publicAddress, amount, status, DframeUserId } = req.body;

    const rewardRequest = new RewardRequest({
      publicAddress,
      amount,
      status,
      DframeUserId
    });

    const savedRewardRequest = await rewardRequest.save();
    res.status(201).json(savedRewardRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Read operation - get all reward requests
async function getAllRewardRequests(req, res) {
  try {
    const rewardRequests = await RewardRequest.find();
    res.status(200).json(rewardRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Read operation - get a single entry by publicAddress
async function getRewardRequestByPublicAddress(req, res) {
  try {
    const { publicAddress } = req.params;
    const rewardRequest = await RewardRequest.findOne({ publicAddress });
    if (rewardRequest) {
      res.status(200).json(rewardRequest);
    } else {
      res.status(404).json({ error: 'Reward request not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update operation - update status by publicAddress
async function updateRewardRequestStatus(req, res) {
  try {
    const { publicAddress } = req.params;
    const { newStatus } = req.body;

    const updatedRewardRequest = await RewardRequest.findOneAndUpdate(
      { publicAddress },
      { $set: { status: newStatus } },
      { new: true }
    );

    if (updatedRewardRequest) {
      res.status(200).json(updatedRewardRequest);
    } else {
      res.status(404).json({ error: 'Reward request not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Delete operation
async function deleteRewardRequest(req, res) {
  try {
    const { publicAddress } = req.params;
    const deletedRewardRequest = await RewardRequest.findOneAndDelete({ publicAddress });

    if (deletedRewardRequest) {
      res.status(200).json(deletedRewardRequest);
    } else {
      res.status(404).json({ error: 'Reward request not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createRewardRequest,
  getAllRewardRequests,
  getRewardRequestByPublicAddress,
  updateRewardRequestStatus,
  deleteRewardRequest
};
