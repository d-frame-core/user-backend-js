/** @format */

const mongoose = require('mongoose');

const learnMoreSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
});

learnMoreSchema.statics.build = (attrs) => {
  return new LearnMore(attrs);
};

const LearnMore = mongoose.model('LearnMore', learnMoreSchema);

module.exports = { LearnMore };
