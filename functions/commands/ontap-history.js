const lib = require('lib')({ token: process.env.STDLIB_TOKEN });

const { log } = lib.utils({ service: process.env.STDLIB_SERVICE_NAME });

const storage = require('../../helpers/storage');


/**
* /ontap_history
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
  log('history: received event', { user, channel, event });

  const history = await storage.getHistory();
  const fields = history.map(a => (
    {
      title: `${a.drink} (${a.meta.createdAt})`,
      value: a.meta.createdBy,
    }
  ));
  const fallback = fields.map(f => f.title).join(' | ');
  const attachments = [
    {
      pretext: 'History',
      fallback,
      fields,
    },
  ];

  log('history: response', { attachments });

  return {
    response_type: 'in_channel',
    attachments,
  };
};
