const lib = require('lib')({ token: process.env.STDLIB_TOKEN });

const { log } = lib.utils({ service: process.env.STDLIB_SERVICE_NAME });

const attachmentHelper = require('../../helpers/attachments');

/**
* /ontap
*
*   See https://api.slack.com/slash-commands for more details.
*   See https://api.slack.com/docs/message-attachments for more info.
*
* @param {string} user The user id of the user that invoked this command (name is usable as well)
* @param {string} channel The channel id the command was executed in (name is usable as well)
* @param {string} text The text contents of the command
* @param {object} event The full Slack command object
* @param {string} botToken The bot token for the Slack bot you have activated
* @returns {object}
*/
module.exports = async (user, channel, text = '', event = {}, botToken = null) => { // eslint-disable-line no-unused-vars
  log('ontap: received event', { user, channel, event });

  const attachments = await attachmentHelper.getForEverythingOnTap();

  log('ontap: response', { attachments });

  return {
    response_type: 'in_channel',
    attachments,
  };
};
