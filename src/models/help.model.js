/** @format */

const mongoose = require('mongoose');

const helpSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
});

helpSchema.statics.build = (attrs) => {
  return new Help(attrs);
};

const Help = mongoose.model('Help', helpSchema);

module.exports = { Help };
