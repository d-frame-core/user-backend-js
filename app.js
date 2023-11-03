/** @format */
const express = require('express');
const helmet = require('helmet');
const { LearnMoreRouter } = require('./src/api/learnmore.route');
const { RewardsRouter } = require('./src/api/rewards.route');
const { HelpRouter } = require('./src/api/help.route.js');
const { FaqRouter } = require('./src/api/faq.route');
const { UserRouter } = require('./src/api/user.route');
const { AdRouter } = require('./src/api/ad.route');
const cors = require('cors');
const SurveyRouter = require('./src/api/survey.route');
const { DexRouter } = require('./src/api/dex.router.js');
const app = express();
app.use(express.json({ limit: '500mb' }));

app.use(cors());
app.use(express.urlencoded({ extended: false }));
// app.use(express.json());
app.set('trust proxy', true);

app.use(
  helmet({
    frameguard: {
      action: 'deny',
    },
    hidePoweredBy: true,
    xssFilter: true,
    noSniff: true,
    ieNoOpen: true,
    hsts: {
      maxAge: 7776000,
      force: true,
    },
  })
);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS'
  );
  next();
});

app.use('/rewards', RewardsRouter);
app.use('/user', UserRouter);
app.use('/learnmore', LearnMoreRouter);
app.use('/help', HelpRouter);
app.use('/faq', FaqRouter);
app.use('/ad', AdRouter);
app.use('/survey', SurveyRouter);
app.use('/dex', DexRouter);
app.use('/', (req, res) => {
  res.status(200).send('App is live');
});

module.exports = { app };
