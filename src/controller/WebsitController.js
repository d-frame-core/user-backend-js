/** @format */
// const cron = require('node-cron');
const { WebsiteData } = require('../models/websites.model'); // Import your Mongoose model
const { Tag } = require('../models/Tags');
// Define a function to update the status
const dataPool = async (req, res) => {
  try {
    const tags = await Tag.find().populate({
      path: 'websites',
      model: 'WebsiteData',
      select: 'website visitorCounts',
    });

    const result = tags.map((tag) => {
      const websites = tag.websites.map((website) => ({
        name: website.website, 
        website: website.website, 
        visitorCounts: website.visitorCounts,
      }));
 
      return { 
        tag: tag.name,
        status: tag.status,
        websites,
        totalVisitors: websites.reduce(
          (total, site) => total + site.visitorCounts,
          0
        ),
      };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  dataPool
};
