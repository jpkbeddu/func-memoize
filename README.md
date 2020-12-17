## Function Memoizer

To cache the output of any function with a distribution memory cache like Redis

## Usage

```js
const FuncMemoize = require('func-memoize');

FuncMemoize.init({ redisClient: existingRedisClient });

const yourCachedFunction = FuncMemoize.cache(yourFunction, { ttl: 10 /* Sec */ });

yourCachedFunction(/* same parameters as yourFunction */);
```

## Roadmap

- [ ] Support for simple single process in-memory cache
- [ ] Support for memcached
- [ ] Support for Redis cluster/replica
- [ ] Add benchmark samples
- [ ] and more...
