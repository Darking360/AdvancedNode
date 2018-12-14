const moongose = require('mongoose');
const exec = moongose.Query.prototype.exec;
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');
const client = redis.createClient(keys.redisUrl);

client.hget = util.promisify(client.hget)

moongose.Query.prototype.cache = function(options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || 'default');
  return this;
}

moongose.Query.prototype.exec = async function() {
  if (!this.useCache) return exec.apply(this, arguments);
  
  let key = Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name
  });

  const value = await client.hget(this.hashKey, JSON.stringify(key));

  if (value) {
    console.log('Cache ----->');
    const doc = JSON.parse(value);
    return Array.isArray(doc) 
    ? doc.map((individualDoc) => new this.model(individualDoc)) 
    : new this.model(JSON.parse(value));
  };
  const result = await exec.apply(this, arguments);
  client.hset(this.hashKey, JSON.stringify(key), JSON.stringify(result), 'EX', 10);
  return result;

};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  },
};