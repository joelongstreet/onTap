const lib = require('lib')({ token: process.env.STDLIB_TOKEN });

const { log } = lib.utils({ service: process.env.STDLIB_SERVICE_NAME });

const storage = require('../../helpers/storage');
const attachmentHelper = require('../../helpers/attachments');


/**
* /ontap_tap
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
  log('tap: received event', { user, channel, event });

  const args = text.split('|');
  const drink = args[0] ? args[0].trim() : undefined;
  const location = args[1] ? args[1].trim() : undefined;
  const link = args[2] ? args[2].trim() : undefined;

  if (!drink) return new Error('nothing to tap? see "/ontap help"');

  await storage.tap(drink, location, link, user, channel);
  const attachments = await attachmentHelper.getForEverythingOnTap();

  log('tap: response', { attachments });

  return {
    response_type: 'in_channel',
    attachments,
  };
};
