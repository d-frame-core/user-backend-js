/** @format */

const express = require('express');
const { LearnMore } = require('../models/learnmore.model');
const verifyToken = require('../middleware/middleware');
const router = express.Router();

router.get('/api/learnmore/getall', verifyToken, async (req, res) => {
  try {
    const learnMore = await LearnMore.find({});
    console.log('/api/learnmore/getall GET CALLED');
    res.status(200).json(learnMore);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

module.exports.LearnMoreRouter = router;
