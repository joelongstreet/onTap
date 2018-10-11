const storage = require('./storage');

module.exports = {
  getForEverythingOnTap: async () => {
    const available = await storage.getEverythingOnTap();
    return available.map(a => ({
      color: '#FDD24E',
      fallback: a.drink,
      title: a.drink,
      title_link: a.link,
      text: a.location,
      footer: a.id,
    }));
  },
};
