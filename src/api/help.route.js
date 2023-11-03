/** @format */

const express = require('express');
const { Help } = require('../models/help.model');
const verifyToken = require('../middleware/middleware');
const router = express.Router();

router.get('/api/help/getall', verifyToken, async (req, res) => {
  try {
    const help = await Help.find({});
    console.log('/api/help/getall GET CALLED');
    res.status(200).json(help);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

module.exports.HelpRouter = router;
