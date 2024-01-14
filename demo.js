/** @format */

const ipfsAPI = require('ipfs-api');
const fs = require('fs');

const ipfs = ipfsAPI('34.131.52.220', '5001'); // Adjust the host and port if needed

const message = 'Hello there!';

// Create a Buffer from the message
const messageBuffer = Buffer.from(message, 'utf-8');

// Add the message to IPFS
ipfs.add(messageBuffer, (err, files) => {
  if (err) {
    console.error('Error adding message to IPFS:', err);
  } else {
    const ipfsHash = files[0].hash;
    console.log('Message added to IPFS. IPFS hash:', ipfsHash);

    // Retrieve the data from IPFS using the IPFS hash
    ipfs.cat(ipfsHash, (catErr, data) => {
      if (catErr) {
        console.error('Error retrieving data from IPFS:', catErr);
      } else {
        console.log('Retrieved data from IPFS:', data.toString('utf-8'));
      }
    });
  }
});
