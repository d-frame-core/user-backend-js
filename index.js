/** @format */

const mongoose = require('mongoose');
const { app } = require('./app');
require('dotenv').config();
const PORT = process.env.PORT || 8080;
const start = async () => {
  try {
    await mongoose
      .connect(
        'mongodb+srv://dframe_admin:ONWbUyM5ADDBxAE5@cluster0.jcsev3b.mongodb.net/Ad-Campaign',
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      )
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
