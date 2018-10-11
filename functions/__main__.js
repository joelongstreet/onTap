const ejs = require('ejs');
const path = require('path');

const template = path.join(__dirname, '/../pages/index.ejs');

const ENV = {
  SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID,
  SLACK_REDIRECT: process.env.SLACK_REDIRECT,
  SLACK_OAUTH_SCOPE: process.env.SLACK_OAUTH_SCOPE,
};

/**
* The "Add to Slack" landing page
* @returns {buffer}
*/
module.exports = (callback) => {
  ejs.renderFile(template, ENV, {}, (err, response) => {
    callback(err, Buffer.from(response || ''), { 'Content-Type': 'text/html' });
  });
};
