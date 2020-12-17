const FuncMemoize = require('./index');

let client;

beforeAll((done) => {
  client = FuncMemoize.init({}, done);
});

afterAll((done) => {
  client.quit(done);
});

test('Init Cache', () => {
  expect(client.connected).toBe(true);
});

test('Cache SUM function', async (done) => {
  function sum(a, b) {
    return a + b;
  }

  const cachedSum = await FuncMemoize.cache(sum, { ttl: 10 });

  const sums = [
    await cachedSum(1, 2),
    await cachedSum(1, 2),
    await cachedSum(2, 2),
    await cachedSum(2, 2),
    await cachedSum(3, 2),
  ];

  expect(sums).toStrictEqual([3, 3, 4, 4, 5]);

  done();
  return;
});

test('Cache async SUM function', async (done) => {
  async function asyncSum(a, b) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(a + b);
      }, 500);
    });
  }

  const cachedAsyncSum = await FuncMemoize.cache(asyncSum, { ttl: 10 });

  const sums = [
    await cachedAsyncSum(1, 2),
    await cachedAsyncSum(1, 2),
    await cachedAsyncSum(2, 2),
    await cachedAsyncSum(2, 2),
    await cachedAsyncSum(3, 2),
  ];

  expect(sums).toStrictEqual([3, 3, 4, 4, 5]);

  done();
  return;
});

test('Cache async Object function', async (done) => {
  async function asyncObjectMerge(a, b) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Object.assign({}, a, b));
      }, 500);
    });
  }

  const cachedAsyncObjectMerge = await FuncMemoize.cache(asyncObjectMerge, { ttl: 10 });

  const sums = [
    await cachedAsyncObjectMerge(
      {
        a: [1, 2, 3, ['a', 1, '3']],
        b: [{ c: { d: [{ e: { f: 'g' } }] } }],
        e: { x: [1], y: { 2: 3 } },
      },
      {
        c: [1, 2, 3, ['a', 1, '3']],
        f: { y: { 2: 3 }, x: [1] },
        d: [{ c: { d: [{ e: { f: 'g' } }] } }],
      }
    ),
    await cachedAsyncObjectMerge(
      {
        a: [1, 2, 3, ['a', 1, '3']],
        e: { x: [1], y: { 2: 3 } },
        b: [{ c: { d: [{ e: { f: 'g' } }] } }],
      },
      {
        f: { y: { 2: 3 }, x: [1] },
        c: [1, 2, 3, ['a', 1, '3']],
        d: [{ c: { d: [{ e: { f: 'g' } }] } }],
      }
    ),
    await cachedAsyncObjectMerge(
      {
        a: [1, 2, 3, ['a', 1, '3']],
        b: [{ c: { d: [{ e: { f: 'ONLY_CHANGE' } }] } }],
      },
      {
        c: [1, 2, 3, ['a', 1, '3']],
        d: [{ c: { d: [{ e: { f: 'g' } }] } }],
      }
    ),
    await cachedAsyncObjectMerge(
      {
        a: [1, 2, 3, ['a', 1, '3']],
        b: [{ c: { d: [{ e: { f: 'ONLY_CHANGE' } }] } }],
      },
      {
        c: [1, 2, 3, ['a', 1, '3']],
        d: [{ c: { d: [{ e: { f: 'g' } }] } }],
      }
    ),
  ];

  expect(sums).toStrictEqual([
    {
      a: [1, 2, 3, ['a', 1, '3']],
      b: [{ c: { d: [{ e: { f: 'g' } }] } }],
      c: [1, 2, 3, ['a', 1, '3']],
      d: [{ c: { d: [{ e: { f: 'g' } }] } }],
      e: { x: [1], y: { 2: 3 } },
      f: { y: { 2: 3 }, x: [1] },
    },
    {
      a: [1, 2, 3, ['a', 1, '3']],
      b: [{ c: { d: [{ e: { f: 'g' } }] } }],
      c: [1, 2, 3, ['a', 1, '3']],
      d: [{ c: { d: [{ e: { f: 'g' } }] } }],
      e: { x: [1], y: { 2: 3 } },
      f: { y: { 2: 3 }, x: [1] },
    },
    {
      a: [1, 2, 3, ['a', 1, '3']],
      b: [{ c: { d: [{ e: { f: 'ONLY_CHANGE' } }] } }],
      c: [1, 2, 3, ['a', 1, '3']],
      d: [{ c: { d: [{ e: { f: 'g' } }] } }],
    },
    {
      a: [1, 2, 3, ['a', 1, '3']],
      b: [{ c: { d: [{ e: { f: 'ONLY_CHANGE' } }] } }],
      c: [1, 2, 3, ['a', 1, '3']],
      d: [{ c: { d: [{ e: { f: 'g' } }] } }],
    },
  ]);

  done();
  return;
});
