const clearHash = require('../services/cache').clearHash;

module.exports = async (req, res, next) => {
  await next();
  clearHash(req.user.id);
};
