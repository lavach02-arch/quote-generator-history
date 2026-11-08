import express from 'express';
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
} from '../controllers/quoteController.js';

const router = express.Router();

// Quote Generation Endpoints
router.get('/quotes/random', getRandomQuote);
router.get('/quotes/daily', getDailyQuote);
router.get('/quotes/categories', getCategories);

// Favorites History Endpoints
router.get('/favorites', listFavorites);
router.post('/favorites', saveFavorite);
router.delete('/favorites/:id', deleteFavorite);
router.post('/favorites/toggle', toggleFavorite);
router.get('/favorites/check', checkFavorite);

// Stats
router.get('/stats', getStats);

export default router;
