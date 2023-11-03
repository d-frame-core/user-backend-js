/** @format */

const mongoose = require('mongoose');
const { app } = require('./app');
require('dotenv').config();
const PORT = process.env.PORT || 8080;
const start = async () => {
  try {
    await mongoose
      .connect(`${process.env.MONGOSTRING}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log('Connected to database');
      });
  } catch (err) {
    console.error(err);
  }
  app.listen(PORT, () => {
    console.log('APP STARTED ON PORT', PORT);
  });
};

start();
