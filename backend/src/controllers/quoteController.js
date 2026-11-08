import {
  fetchRandomQuote,
  getQuoteOfTheDay,
  CATEGORIES,
} from '../utils/quoteService.js';
import {
  getAllFavorites,
  getFavoriteById,
  addFavorite,
  removeFavorite,
  removeFavoriteByText,
  isFavorited,
  getFavoritesStats,
} from '../utils/storage.js';

/**
 * Fetches a random quote (with category filter) and appends favorite status.
 * GET /api/quotes/random
 */
export async function getRandomQuote(req, res) {
  try {
    const { category } = req.query;
    const quote = await fetchRandomQuote(category);
    const favorited = isFavorited(quote.quoteText);

    return res.status(200).json({
      success: true,
      quote: {
        ...quote,
        isFavorited: favorited,
      },
    });
  } catch (err) {
    console.error('Error fetching random quote:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch quote',
      error: err.message,
    });
  }
}

/**
 * Returns Quote of the Day.
 * GET /api/quotes/daily
 */
export function getDailyQuote(req, res) {
  try {
    const quote = getQuoteOfTheDay();
    const favorited = isFavorited(quote.quoteText);

    return res.status(200).json({
      success: true,
      quote: {
        ...quote,
        isFavorited: favorited,
      },
    });
  } catch (err) {
    console.error('Error getting daily quote:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Returns available quote categories.
 * GET /api/quotes/categories
 */
export function getCategories(req, res) {
  return res.status(200).json({
    success: true,
    categories: CATEGORIES,
  });
}

/**
 * Lists user's favorited quotes history.
 * GET /api/favorites
 */
export function listFavorites(req, res) {
  try {
    const { search, category, sort } = req.query;
    const favorites = getAllFavorites({ search, category, sort });

    return res.status(200).json({
      success: true,
      count: favorites.length,
      favorites,
    });
  } catch (err) {
    console.error('Error listing favorites:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Saves a quote to user favorites.
 * POST /api/favorites
 */
export function saveFavorite(req, res) {
  try {
    const { quoteText, author, category, tags, notes, source } = req.body || {};

    if (!quoteText || typeof quoteText !== 'string' || quoteText.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'quoteText is required and must be at least 3 characters',
      });
    }

    const { favorite, isDuplicate } = addFavorite({
      quoteText,
      author: author || 'Unknown',
      category: category || 'Wisdom',
      tags,
      notes,
      source,
    });

    return res.status(isDuplicate ? 200 : 201).json({
      success: true,
      message: isDuplicate ? 'Quote is already in your favorites' : 'Quote saved to favorites history!',
      isDuplicate,
      favorite,
    });
  } catch (err) {
    console.error('Error saving favorite:', err);
    return res.status(500).json({ success: false, message: 'Server error saving favorite' });
  }
}

/**
 * Removes quote from favorites by ID.
 * DELETE /api/favorites/:id
 */
export function deleteFavorite(req, res) {
  try {
    const { id } = req.params;
    const removed = removeFavorite(id);

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: `Favorite with ID '${id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Quote removed from favorites',
      deletedId: id,
    });
  } catch (err) {
    console.error('Error deleting favorite:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting favorite' });
  }
}

/**
 * Toggles a quote's favorite state by quote text.
 * POST /api/favorites/toggle
 */
export function toggleFavorite(req, res) {
  try {
    const { quoteText, author, category, tags, notes } = req.body || {};

    if (!quoteText || typeof quoteText !== 'string') {
      return res.status(400).json({ success: false, message: 'quoteText is required' });
    }

    if (isFavorited(quoteText)) {
      const removed = removeFavoriteByText(quoteText);
      return res.status(200).json({
        success: true,
        isFavorited: false,
        message: 'Removed from favorites',
        favorite: removed,
      });
    } else {
      const { favorite } = addFavorite({ quoteText, author, category, tags, notes });
      return res.status(201).json({
        success: true,
        isFavorited: true,
        message: 'Added to favorites',
        favorite,
      });
    }
  } catch (err) {
    console.error('Error toggling favorite:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Checks if a quote text is favorited.
 * GET /api/favorites/check?text=...
 */
export function checkFavorite(req, res) {
  try {
    const text = req.query.text || '';
    const favorited = isFavorited(text);
    return res.status(200).json({
      success: true,
      isFavorited: favorited,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Returns favorites history analytics and stats.
 * GET /api/stats
 */
export function getStats(req, res) {
  try {
    const stats = getFavoritesStats();
    return res.status(200).json({
      success: true,
      ...stats,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
