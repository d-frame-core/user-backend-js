/** @format */
const express = require('express');
const { default: Web3 } = require('web3');
require('dotenv').config();
const router = express.Router();
const dframeAddress = '0x0B6163c61D095b023EC3b52Cc77a9099f6231FCC';

const dframeABI = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'Snapshot',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      {
        internalType: 'uint256',
        name: 'snapshotId',
        type: 'uint256',
      },
    ],
    name: 'balanceOfAt',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'burnFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      {
        internalType: 'uint256',
        name: 'subtractedValue',
        type: 'uint256',
      },
    ],
    name: 'decreaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      {
        internalType: 'uint256',
        name: 'addedValue',
        type: 'uint256',
      },
    ],
    name: 'increaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'snapshot',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'snapshotId',
        type: 'uint256',
      },
    ],
    name: 'totalSupplyAt',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

router.get('/wallet-data/:publicAddress', async (req, res) => {
  try {
    const userWalletAddress = req.params.publicAddress;
    const web3 = new Web3(
      'https://polygon-mainnet.g.alchemy.com/v2/nHyM53VqfExPfPNYL5VLT1urCiUOunq_'
    );

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

router.get('/api/wallet-balance/:publicAddress', async (req, res) => {
  try {
    const web3 = new Web3(process.env.ALCHEMY_RPC);
    const userWalletAddress = req.params.publicAddress;

    // get the DFT token contract instance
    const dframeContract = new web3.eth.Contract(dframeABI, dframeAddress);

    // get the balance of DFRAME tokens for the specified wallet address
    const balance = await dframeContract.methods
      .balanceOf(userWalletAddress)
      .call();
    const balanceInEth = web3.utils.fromWei(balance, 'ether');
    const balanceInKFormat = Math.trunc(balanceInEth / 1000).toString() + 'k';

    res.json({ balance: balanceInKFormat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/past-transactions/:publicAddress', async (req, res) => {
  try {
    const userWalletAddress = req.params.publicAddress;
    const web3 = new Web3(process.env.ALCHEMY_RPC);

    // Get the DFT token contract instance
    const dframeContract = new web3.eth.Contract(dframeABI, dframeAddress);

    const transferFromEvents = await dframeContract.getPastEvents('Transfer', {
      fromBlock: 0,
      toBlock: 'latest',
      filter: {
        from: userWalletAddress,
      },
    });

    console.log('Entered past transactions');
    const eventFromPromises = transferFromEvents.map(async (event) => {
      const block = await web3.eth.getBlock(event.blockNumber);
      return {
        ...event,
        timestamp: BigInt(block.timestamp).toString(), // Convert BigInt to string
      };
    });

    const eventsFromWithTimestamps = await Promise.all(eventFromPromises);

    const transferToEvents = await dframeContract.getPastEvents('Transfer', {
      fromBlock: 0,
      toBlock: 'latest',
      filter: {
        to: userWalletAddress,
      },
    });

    const eventToPromises = transferToEvents.map(async (event) => {
      const block = await web3.eth.getBlock(event.blockNumber);
      return {
        ...event,
        timestamp: BigInt(block.timestamp).toString(), // Convert BigInt to string
      };
    });

    const eventsToWithTimestamps = await Promise.all(eventToPromises);

    const allEvents = [...eventsFromWithTimestamps, ...eventsToWithTimestamps];

    // Convert BigInt values back to strings/numbers
    const sortedEventsString = allEvents.map((event) => {
      const returnValues = event.returnValues;
      const convertedReturnValues = {};
      for (const key in returnValues) {
        if (BigInt(returnValues[key])) {
          convertedReturnValues[key] = returnValues[key].toString();
        } else if (!isNaN(Number(returnValues[key]))) {
          convertedReturnValues[key] = String(Number(returnValues[key]));
        } else {
          convertedReturnValues[key] = returnValues[key];
        }
      }
      return {
        ...event,
        timestamp: event.timestamp.toString(),
        transactionIndex: event.transactionIndex.toString(),
        blockNumber: event.blockNumber.toString(),
        logIndex: event.logIndex.toString(), // Convert logIndex to string
        returnValues: convertedReturnValues,
      };
    });
    const sortedEvents = sortedEventsString.sort((a, b) => {
      const timestampA = BigInt(a.timestamp);
      const timestampB = BigInt(b.timestamp);
      const logIndexA = BigInt(a.logIndex);
      const logIndexB = BigInt(b.logIndex);
      // You can choose either timestamp or logIndex for sorting
      return timestampA < timestampB
        ? 1
        : timestampA > timestampB
        ? -1
        : logIndexA < logIndexB
        ? 1
        : logIndexA > logIndexB
        ? -1
        : 0;
    });

    // Send the response
    console.log(sortedEvents);
    res.json({ pastTransactions: sortedEvents });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
module.exports.WalletRouter = router;
