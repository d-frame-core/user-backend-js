/** @format */

const RewardRequest = require('../models/reward.model');
const { DFrameUser } = require('../models/user.model');

// Create operation
async function createRewardRequest(req, res) {
  try {
    const { publicAddress, amount, status, DframeUserId } = req.body;

    const rewardRequest = new RewardRequest({
      publicAddress: publicAddress,
      amount: amount,
      status: status,
      DframeUserId: DframeUserId,
    });

    const savedRewardRequest = await rewardRequest.save();
    console.log('Called createRewardRequest succesfully');
    res.status(201).json(savedRewardRequest);
  } catch (error) {
    console.log('Error in createRewardRequest: ', error);
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
    const deletedRewardRequest = await RewardRequest.findOneAndDelete({
      publicAddress,
    });

    if (deletedRewardRequest) {
      res.status(200).json(deletedRewardRequest);
    } else {
      res.status(404).json({ error: 'Reward request not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
async function getRewardHistoryByPublicAddress(req, res) {
  try {
    const { publicAddress } = req.params;
    const rewardHistory = await RewardRequest.find({ publicAddress });
    if (rewardHistory.length > 0) {
      res.status(200).json(rewardHistory);
    } else {
      res.status(404).json({
        error: 'No reward history found for the provided publicAddress',
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// async function getRewardsForPublicAddress(req, res) {
//   // Get the current date and the first day of the previous month
//   const publicAddress = req.params.publicAddress;
//   const currentDate = new Date();

//   // Adjust currentDate to be one day before the actual current date
//   currentDate.setDate(currentDate.getDate() - 1);

//   const firstDayOfPreviousMonth = new Date();
//   firstDayOfPreviousMonth.setMonth(firstDayOfPreviousMonth.getMonth() - 1);
//   firstDayOfPreviousMonth.setDate(1);
//   firstDayOfPreviousMonth.setHours(0, 0, 0, 0);

//   // Query users with rewards data
//   const user = await DFrameUser.findOne({ publicAddress });

//   // Calculate one-time rewards for the user
//   const userOneTimeRewards =
//     user.rewards.oneTime.kyc1.rewards +
//       user.rewards.oneTime.kyc2.rewards +
//       user.rewards.oneTime.kyc3.rewards || 2;

//   // Calculate daily rewards for the user
//   let userDailyRewards = 0;
//   user.rewards.daily.forEach((dailyEntry) => {
//     dailyEntry.browserData.forEach((entry) => {
//       userDailyRewards += entry.rewards;
//       console.log('dailt for user nad data', user._id);
//     });

//     dailyEntry.ad.forEach((entry) => {
//       userDailyRewards += entry.rewards;
//     });

//     dailyEntry.survey.forEach((entry) => {
//       userDailyRewards += entry.rewards;
//     });

//     dailyEntry.referral.forEach((entry) => {
//       userDailyRewards += entry.rewards;
//     });
//   });

//   // return both monthly and daily to frontend
//   res.status(200).json({
//     userOneTimeRewards,
//     userDailyRewards,
//   });
// }

async function getRewardsForPublicAddress(req, res) {
  const publicAddress = req.params.publicAddress;

  const user = await DFrameUser.findOne({ publicAddress });
  const pendingReward = await RewardRequest.findOne({
    publicAddress,
    status: 'PENDING',
  });
  if (pendingReward) {
    console.log('pending reward', pendingReward);
    return res.status(200).json({
      status: 'PENDING',
      data: 'YOU ALREADY HAVE A PENDING REQUEST',
    });
  }

  let userOneTimeRewards = 0;
  if (user.rewards.oneTime.kyc1.status.toUpperCase() === 'UNPAID') {
    userOneTimeRewards += user.rewards.oneTime.kyc1.rewards;
  }
  if (user.rewards.oneTime.kyc2.status.toUpperCase() === 'UNPAID') {
    userOneTimeRewards += user.rewards.oneTime.kyc2.rewards;
  }
  if (user.rewards.oneTime.kyc3.status.toUpperCase() === 'UNPAID') {
    userOneTimeRewards += user.rewards.oneTime.kyc3.rewards;
  }

  // let userDailyRewards = 0;
  // user.rewards.daily.forEach((dailyEntry) => {
  //   if (dailyEntry.status === 'UNPAID') {
  //     dailyEntry.browserData.forEach((entry) => {
  //       userDailyRewards += entry.rewards;
  //     });

  //     dailyEntry.ad.forEach((entry) => {
  //       userDailyRewards += entry.rewards;
  //     });

  //     dailyEntry.survey.forEach((entry) => {
  //       userDailyRewards += entry.rewards;
  //     });

  //     dailyEntry.referral.forEach((entry) => {
  //       userDailyRewards += entry.rewards;
  //     });
  //   }
  // });
  const currentDate = new Date();
  const startingDate = new Date('2023-01-01').toLocaleDateString('en-GB'); // Replace with your actual starting date
  const previousMonthDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  ).toLocaleDateString('en-GB');

  console.log('previous month date', previousMonthDate);
  console.log('starting date', startingDate);

  let totalDailyRewards = 0;

  // Iterate through daily rewards and calculate total rewards till previous month with matching date and status
  user.rewards.daily.forEach((dailyEntry) => {
    const entryDate = new Date(dailyEntry.date).toLocaleDateString('en-GB');

    if (
      entryDate >= startingDate &&
      entryDate <= previousMonthDate &&
      dailyEntry.status.toUpperCase() === 'UNPAID'
    ) {
      dailyEntry.browserData.forEach((entry) => {
        totalDailyRewards += entry.rewards;
      });
      dailyEntry.ad.forEach((entry) => {
        totalDailyRewards += entry.rewards;
      });
      dailyEntry.survey.forEach((entry) => {
        totalDailyRewards += entry.rewards;
      });
      dailyEntry.referral.forEach((entry) => {
        totalDailyRewards += entry.rewards;
      });
    }
  });
  res.status(200).json({
    userOneTimeRewards,
    totalDailyRewards,
  });
}

module.exports = {
  createRewardRequest,
  getAllRewardRequests,
  getRewardRequestByPublicAddress,
  updateRewardRequestStatus,
  deleteRewardRequest,
  getRewardHistoryByPublicAddress,
  getRewardsForPublicAddress,
};
