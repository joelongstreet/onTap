/**
  StdLib Storage Utility for Slack

  Using your StdLib Library Token, connect to `utils.storage` (key-value storage)
  and save team identity data (bot access token, etc.) for future reference.
*/

const lib = require('lib')({ token: process.env.STDLIB_TOKEN });

const store = lib.utils.storage['@0.1.6'];
const uuid = lib.core.uuid['@0.1.0'];
const CACHE = {};

const STORAGE_KEYS = {
  ON_TAP: 'on-tap',
  HISTORY: 'history',
};

function formatKey(key) {
  return `SLACK::${process.env.SLACK_APP_NAME}::${key}`;
}

async function createList(keyString) {
  const key = formatKey(keyString);
  return new Promise((resolve, reject) => {
    store.list.create({ key }, (err, res) => {
      if (err) reject(err);
      else resolve(res || []);
    });
  });
}

async function get(keyString) {
  const key = formatKey(keyString);
  return new Promise((resolve, reject) => {
    store.get(key, (err, res) => {
      if (err) reject(err);
      else resolve(res || []);
    });
  });
}

async function addToList(keyString, value) {
  await createList(keyString);

  const key = formatKey(keyString);
  return new Promise((resolve, reject) => {
    store.list.add({ key, value }, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

async function removeFromList(keyString, index) {
  const key = formatKey(keyString);
  return new Promise((resolve) => {
    store.list.remove({ key, index }, (err, res) => {
      // store.list.remove always responds with an error even
      // though the item actually gets removed from the list
      resolve(res);
    });
  });
}

module.exports = {
  getEverythingOnTap: async () => {
    const onTap = await get(STORAGE_KEYS.ON_TAP);
    return onTap;
  },

  getHistory: async () => {
    const history = await get(STORAGE_KEYS.HISTORY);
    return history;
  },

  tap: async (drink, location, link, author, channel) => {
    const id = await uuid();
    const meta = {
      createdBy: author,
      createdFrom: channel,
      createdAt: new Date(),
    };

    await addToList(STORAGE_KEYS.ON_TAP, {
      id,
      drink,
      location,
      link,
      meta,
    });
  },

  retire: async (id, author, channel) => {
    const available = await get(STORAGE_KEYS.ON_TAP);

    const record = available.find(a => a.id === id);
    if (record) {
      record.meta.deletedAt = new Date();
      record.meta.deletedBy = author;
      record.meta.deletedFrom = channel;

      const index = available.findIndex(a => a.id === record.id);
      await removeFromList(STORAGE_KEYS.ON_TAP, index);

      await addToList(STORAGE_KEYS.HISTORY, record);
      return record;
    }

    return false;
  },

  setTeam: (teamId, value, callback) => {
    lib.utils.storage.set(formatKey(teamId), value, (err, val) => {
      if (!err) {
        CACHE[teamId] = val;
      }
      callback(err, val);
    });
  },

  getTeam: (teamId, callback) => {
    if (CACHE[teamId]) {
      return callback(null, CACHE[teamId]);
    }
    return lib.utils.storage.get(formatKey(teamId), (err, value) => {
      if (!err) {
        CACHE[teamId] = value;
      }
      return callback(err, value);
    });
  },
};
