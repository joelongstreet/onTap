const lib = require('lib')({ token: process.env.STDLIB_TOKEN });

const { log } = lib.utils({ service: process.env.STDLIB_SERVICE_NAME });

const storage = require('../../helpers/storage');
const attachmentHelper = require('../../helpers/attachments');


/**
* /ontap_retire
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
  log('retire: received event', { user, channel, event });

  const id = text.trim() || undefined;

  if (!id) {
    return new Error('id required');
  }

  const retired = await storage.retire(id, user, channel);
  if (!retired) return new Error(`could not find record with id ${id}`);

  const attachments = await attachmentHelper.getForEverythingOnTap();
  if (attachments[0]) {
    attachments[0].pretext = `${retired.name} has been retired`;
  }

  log('retire: response', { attachments });

  return {
    response_type: 'in_channel',
    attachments,
  };
};
