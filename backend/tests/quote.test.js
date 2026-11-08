import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getRandomQuote,
  getDailyQuote,
  getCategories,
  listFavorites,
  saveFavorite,
  deleteFavorite,
  toggleFavorite,
  checkFavorite,
  getStats,
} from '../src/controllers/quoteController.js';
import { resetFavorites } from '../src/utils/storage.js';

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, val) {
      this.headers[name.toLowerCase()] = val;
      return this;
    },
    json(data) {
      this.headers['content-type'] = 'application/json';
      this.body = data;
      return this;
    },
    send(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

test.beforeEach(() => {
  resetFavorites();
});

// ==========================================
// 1. Quote Generation Tests
// ==========================================
test('Controller: getRandomQuote returns valid quote object', async () => {
  const res = createMockRes();
  await getRandomQuote({ query: {} }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.quote.quoteText);
  assert.ok(res.body.quote.author);
  assert.ok(typeof res.body.quote.isFavorited === 'boolean');
});

test('Controller: getDailyQuote returns deterministic quote of the day', () => {
  const res = createMockRes();
  getDailyQuote({}, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.quote.isDaily, true);
  assert.ok(res.body.quote.quoteText);
});

test('Controller: getCategories returns supported categories', () => {
  const res = createMockRes();
  getCategories({}, res);

  assert.equal(res.statusCode, 200);
  assert.ok(res.body.categories.includes('Technology'));
  assert.ok(res.body.categories.includes('Wisdom'));
});

// ==========================================
// 2. Favorites History Tests
// ==========================================
test('Controller: listFavorites returns all 4 pre-seeded favorites', () => {
  const res = createMockRes();
  listFavorites({ query: {} }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.count, 4);
  assert.equal(res.body.favorites.length, 4);
});

test('Controller: listFavorites filters by category', () => {
  const res = createMockRes();
  listFavorites({ query: { category: 'Technology' } }, res);

  assert.equal(res.statusCode, 200);
  assert.ok(res.body.favorites.every((f) => f.category === 'Technology'));
});

test('Controller: listFavorites searches by query text', () => {
  const res = createMockRes();
  listFavorites({ query: { search: 'code' } }, res);

  assert.equal(res.statusCode, 200);
  assert.ok(res.body.favorites.length >= 1);
});

test('Controller: saveFavorite successfully saves new quote', () => {
  const res = createMockRes();
  saveFavorite(
    {
      body: {
        quoteText: 'Innovation distinguishes between a leader and a follower.',
        author: 'Steve Jobs',
        category: 'Innovation',
        notes: 'Leadership insight',
      },
    },
    res
  );

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.isDuplicate, false);
  assert.equal(res.body.favorite.author, 'Steve Jobs');
});

test('Controller: saveFavorite rejects empty quoteText with 400', () => {
  const res = createMockRes();
  saveFavorite({ body: { quoteText: '' } }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
});

test('Controller: saveFavorite detects duplicate quote and prevents duplicate storage', () => {
  const res = createMockRes();
  saveFavorite(
    {
      body: {
        quoteText: 'First, solve the problem. Then, write the code.', // Already in seeds
        author: 'John Johnson',
      },
    },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.isDuplicate, true);
});

test('Controller: toggleFavorite adds quote when not present, and removes when present', () => {
  const quoteText = 'Continuous improvement is better than delayed perfection.';

  // 1. Add via toggle
  const resAdd = createMockRes();
  toggleFavorite({ body: { quoteText, author: 'Mark Twain' } }, resAdd);
  assert.equal(resAdd.statusCode, 201);
  assert.equal(resAdd.body.isFavorited, true);

  // 2. Remove via toggle
  const resRemove = createMockRes();
  toggleFavorite({ body: { quoteText } }, resRemove);
  assert.equal(resRemove.statusCode, 200);
  assert.equal(resRemove.body.isFavorited, false);
});

test('Controller: checkFavorite checks favorite existence', () => {
  const res = createMockRes();
  checkFavorite(
    { query: { text: 'First, solve the problem. Then, write the code.' } },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.isFavorited, true);
});

test('Controller: deleteFavorite removes favorite by ID', () => {
  const res = createMockRes();
  deleteFavorite({ params: { id: 'fav_seed_001' } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
});

test('Controller: deleteFavorite returns 404 for invalid ID', () => {
  const res = createMockRes();
  deleteFavorite({ params: { id: 'invalid_id_999' } }, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.success, false);
});

test('Controller: getStats returns favorites count and category breakdown', () => {
  const res = createMockRes();
  getStats({}, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.totalFavorites, 4);
  assert.ok(res.body.categories.length >= 2);
  assert.ok(res.body.topAuthors.length >= 2);
});
