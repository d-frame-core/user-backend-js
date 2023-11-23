/** @format */

const express = require('express');
const { Faq } = require('../models/faq.model');
const router = express.Router();

router.get('/api/faq/getall', async (req, res) => {
  try {
    const faq = await Faq.find({});
    res.status(200).json(faq);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

module.exports.FaqRouter = router;
