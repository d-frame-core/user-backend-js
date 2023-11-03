/** @format */

const express = require('express');
const router = express.Router();
const {
  createDFTSale,
  updateDFTSale,
  deleteDFTSale,
  pastTransactions,
} = require('../controller/dex.controller'); // Replace 'yourControllerFileName' with the actual file name containing your controller functions
const verifyToken = require('../middleware/middleware');

// POST endpoint to create DFT for sale
router.post('/api/dft-sale/:publicAddress', verifyToken, createDFTSale);

// PUT endpoint to update DFT for sale
router.put('/api/dft-sale/:publicAddress', verifyToken, updateDFTSale);

// DELETE endpoint to delete DFT for sale
router.delete('/api/dft-sale/:publicAddress', verifyToken, deleteDFTSale);

router.get('/api/pastsale/:publicAddress', verifyToken, pastTransactions);

module.exports = router;
module.exports.DexRouter = router;
