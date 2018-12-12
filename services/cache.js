const moongose = require('mongoose');
const exec = moongose.Query.prototype.exec;
const redis = require('redis');
const util = require('util');
const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);

client.get = util.promisify(client.get)

moongose.Query.prototype.cache = function() {
  this.useCache = true;
  return this;
}

moongose.Query.prototype.exec = async function() {
  if (!this.useCache) return exec.apply(this, arguments);
  
  let key = Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name
  });

  const value = await client.get(JSON.stringify(key));

  if (value) {
    console.log('Cache ----->');
    const doc = JSON.parse(value);
    console.log(doc);
    return Array.isArray(doc) 
    ? doc.map((individualDoc) => new this.model(individualDoc)) 
    : new this.model(JSON.parse(value));
  };
  const result = await exec.apply(this, arguments);
  client.set(JSON.stringify(key), JSON.stringify(result));
  return result;

};