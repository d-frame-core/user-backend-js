/** @format */

const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

faqSchema.statics.build = (attrs) => {
  return new Faq(attrs);
};

const Faq = mongoose.model('Faq', faqSchema);

module.exports = { Faq };
