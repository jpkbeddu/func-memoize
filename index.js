const { promisify } = require('util');
const redis = require('redis');
const debug = require('debug')('func-memoize');
const _TAG = 'F-MEM';

let setAsync;
let setexAsync;
let getAsync;

let client;
let _namespace;

const init = ({ redisClient, namespace } = {}, cb) => {
  client = redisClient || redis.createClient();

  _namespace = namespace || _TAG;

  client.on('error', function (error) {
    debug(`INIT:error`, error);
  });

  client.on('connect', function () {
    debug(`INIT:connected`);

    if (cb && typeof cb === 'function') cb();
  });

  setAsync = promisify(client.set).bind(client);
  setexAsync = promisify(client.setex).bind(client);
  getAsync = promisify(client.get).bind(client);

  return client;
};

function cacheFunction(func, { ttl, prefix = _randomPrefixGen() } = {}) {
  ttl = +ttl;

  if (typeof func !== 'function') throw Error('First parameter should be function');
  if (ttl && isNaN(ttl) && ttl > 0) throw Error('Second paramter must be a positive number');

  const funcName = func.name;

  if (!funcName) throw Error('Invalid function');

  debug(`Cached function - ${funcName}`);

  return async (...args) => {
    const cacheKey = keyMapper(funcName, args, { prefix });

    const cachedData = await tryCache(cacheKey);

    if (cachedData) {
      try {
        return JSON.parse(cachedData);
      } catch (err) {
        console.warn(`Unable to parse Cached data for ${funcName} with ${cacheKey}`, cachedData);
      }
    }

    const freshData = await func(...args);

    // Parallely cache the data
    setCache(cacheKey, JSON.stringify(freshData), ttl)
      .then((setCacheStatus) => debug(`setCacheStatus - ${cacheKey}`, setCacheStatus))
      .catch((err) => debug(`setCacheError - ${cacheKey}`, err));

    return freshData;
  };
}

module.exports = {
  init,
  cache: cacheFunction,
};

function tryCache(key) {
  return getAsync(key);
}

function setCache(key, value, ttl) {
  return !ttl ? setAsync(key, value) : setexAsync(key, ttl, value);
}

function _randomPrefixGen() {
  return 'DEF';

  // A random prefixer will invalidate old cached keys.
  // return +(Math.random() * 1000).toFixed();
}

function keyMapper(name, payloadArr, { prefix } = {}) {
  const _filteredArgs = payloadArr
    .filter((a) => typeof a !== 'function')
    .map((a) => {
      if (typeof a === 'object') return JSON.stringify(a);

      if (Array.isArray(a)) return a.join('_');

      return a;
    });

  return [].concat(_namespace, prefix, name, _filteredArgs).join('__');
}
