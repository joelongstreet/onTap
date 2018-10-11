const request = require('request');
const async = require('async');
const ejs = require('ejs');
const path = require('path');

const storage = require('../helpers/storage.js');

const template = path.join(__dirname, '/../pages/auth.ejs');

/**
* Authorization HTML page to grant Slack App OAuth Permission
* @param {string} code Slack-provided authorization code
* @param {string} error Slack-provided error
* @returns {any}
*/
module.exports = (code = null, error = '', callback) => {

  if (!code) {
    return ejs.renderFile(template, {
      message: 'Failure',
      content: error || 'No auth code given. Try again?',
    }, {}, (err, response) => {
      callback(err, Buffer.from(response || ''), { 'Content-Type': 'text/html' });
    });
  }

  return async.auto({
    auth: (callback) => {
      // post code, app ID, and app secret, to get token
      const authAddress = `https://slack.com/api/oauth.access?client_id=${process.env.SLACK_CLIENT_ID}&client_secret=${process.env.SLACK_CLIENT_SECRET}&code=${code}&redirect_uri=${process.env.SLACK_REDIRECT}`;

      request.get(authAddress, (error, response, body) => {
        if (error) {
          return callback(error);
        }

        let auth;

        try {
          auth = JSON.parse(body);
        } catch (e) {
          return callback(new Error('Could not parse auth'));
        }

        if (!auth.ok) {
          return callback(new Error(auth.error));
        }

        return callback(null, auth);
      });
    },

    identity: ['auth', (results, callback) => {
      const auth = (results || {}).auth || {};
      const url = `https://slack.com/api/auth.test?token=${auth.access_token}`;

      request.get(url, (error, response, body) => {
        if (error) {
          return callback(error);
        }

        try {
          const identity = JSON.parse(body);
          return callback(null, identity);
        } catch (e) {
          return callback(e);
        }
      });
    }],

    team: ['identity', (results, callback) => {
      const auth = (results || {}).auth || {};
      const identity = (results || {}).identity || {};

      const team = {
        id: identity.team_id,
        identity,
        bot: auth.bot,
        auth,
        createdBy: identity.user_id,
        url: identity.url,
        name: identity.team,
        access_token: auth.access_token,
      };

      storage.setTeam(team.id, team, (err) => {
        return callback(err, team);
      });
    }],
  },
  (err) => {
    if (err) {
      return ejs.renderFile(template, {
        message: 'Failure',
        content: err && err.message,
      }, {}, (templateErr, response) => callback(templateErr, Buffer.from(response || ''), { 'Content-Type': 'text/html' }));
    }

    return ejs.renderFile(template, {
      message: 'Success!',
      content: 'You can now invite the bot to your channels and use it!',
    }, {}, (templateErr, response) => callback(templateErr, Buffer.from(response || ''), { 'Content-Type': 'text/html' }));
  });
};
