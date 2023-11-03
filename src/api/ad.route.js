/** @format */

const express = require('express'); // Import Express
const { AdModel } = require('../models/ad.models'); // Import your Mongoose model

const router = express.Router();

router.get('/api/get-particular-ad/:id', async (req, res) => {
  try {
    const foundAd = await AdModel.findById(req.params.id);
    if (foundAd) {
      res.status(200).json(foundAd);
    } else {
      res.status(200).json({ message: 'No ad found' });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

module.exports.AdRouter = router;
