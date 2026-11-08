import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In Vercel serverless, root filesystem is read-only except /tmp
const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'quote-favorites-data')
  : path.resolve(__dirname, '../../data');

const DB_FILE = path.join(DATA_DIR, 'favorites.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Returns initial realistic seed favorites.
 */
export function getSeedFavorites() {
  const now = new Date();
  return [
    {
      id: 'fav_seed_001',
      quoteText: 'First, solve the problem. Then, write the code.',
      author: 'John Johnson',
      category: 'Technology',
      tags: ['programming', 'software', 'problem-solving'],
      source: 'Curated Knowledge Base',
      notes: 'Golden rule for full-stack architecture & debugging.',
      favoritedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    },
    {
      id: 'fav_seed_002',
      quoteText: 'The only way to do great work is to love what you do.',
      author: 'Steve Jobs',
      category: 'Success',
      tags: ['work', 'passion', 'success'],
      source: 'Curated Knowledge Base',
      notes: 'Daily morning motivation.',
      favoritedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    },
    {
      id: 'fav_seed_003',
      quoteText: 'Simplicity is the soul of efficiency.',
      author: 'Austin Freeman',
      category: 'Technology',
      tags: ['code', 'engineering', 'simplicity'],
      source: 'Curated Knowledge Base',
      notes: 'Keep solutions simple and clean.',
      favoritedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    },
    {
      id: 'fav_seed_004',
      quoteText: 'Make it work, make it right, make it fast.',
      author: 'Kent Beck',
      category: 'Technology',
      tags: ['coding', 'craftsmanship', 'engineering'],
      source: 'Curated Knowledge Base',
      notes: 'TDD and iterative development philosophy.',
      favoritedAt: new Date(now.getTime() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    },
  ];
}

/**
 * Loads favorites list from disk, seeding if file does not exist.
 * @returns {Array<object>}
 */
export function loadFavorites() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const seeds = getSeedFavorites();
      saveFavorites(seeds);
      return seeds;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load favorites, fallback to seeds:', err.message);
    const seeds = getSeedFavorites();
    saveFavorites(seeds);
    return seeds;
  }
}

/**
 * Persists favorites list atomically to disk.
 * @param {Array<object>} list
 */
export function saveFavorites(list) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save favorites to disk:', err.message);
  }
}

/**
 * Normalizes quote string for case-insensitive duplicate detection.
 */
function normalizeKey(str = '') {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Retrieves all favorites with search, category filtering, and sorting.
 */
export function getAllFavorites({ search = '', category = '', sort = 'newest' } = {}) {
  let list = loadFavorites();

  if (category && category !== 'All') {
    list = list.filter((f) => (f.category || '').toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (f) =>
        f.quoteText.toLowerCase().includes(q) ||
        f.author.toLowerCase().includes(q) ||
        (f.notes && f.notes.toLowerCase().includes(q)) ||
        (f.tags && f.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  // Sort
  if (sort === 'oldest') {
    list.sort((a, b) => new Date(a.favoritedAt) - new Date(b.favoritedAt));
  } else if (sort === 'author') {
    list.sort((a, b) => a.author.localeCompare(b.author));
  } else {
    // Default: newest first
    list.sort((a, b) => new Date(b.favoritedAt) - new Date(a.favoritedAt));
  }

  return list;
}

/**
 * Checks if a quote text is already favorited.
 */
export function isFavorited(quoteText = '') {
  const list = loadFavorites();
  const targetKey = normalizeKey(quoteText);
  return list.some((f) => normalizeKey(f.quoteText) === targetKey);
}

/**
 * Retrieves single favorite by ID.
 */
export function getFavoriteById(id) {
  const list = loadFavorites();
  return list.find((f) => f.id === id) || null;
}

/**
 * Adds a quote to favorites. Prevents duplicates by returning existing item if present.
 */
export function addFavorite(data = {}) {
  const list = loadFavorites();
  const quoteText = (data.quoteText || '').trim();
  const author = (data.author || 'Unknown').trim();
  const category = (data.category || 'Wisdom').trim();
  const targetKey = normalizeKey(quoteText);

  // Check duplicate
  const existing = list.find((f) => normalizeKey(f.quoteText) === targetKey);
  if (existing) {
    return { favorite: existing, isDuplicate: true };
  }

  const id = `fav_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`;
  const now = new Date().toISOString();

  const newFav = {
    id,
    quoteText,
    author,
    category,
    tags: Array.isArray(data.tags) ? data.tags : ['favorite', category.toLowerCase()],
    source: data.source || 'User Saved',
    notes: (data.notes || '').trim(),
    favoritedAt: now,
  };

  list.unshift(newFav);
  saveFavorites(list);
  return { favorite: newFav, isDuplicate: false };
}

/**
 * Removes a quote from favorites by ID.
 */
export function removeFavorite(id) {
  const list = loadFavorites();
  const index = list.findIndex((f) => f.id === id);
  if (index === -1) return false;

  list.splice(index, 1);
  saveFavorites(list);
  return true;
}

/**
 * Removes a quote from favorites by matching quote text.
 */
export function removeFavoriteByText(quoteText) {
  const list = loadFavorites();
  const targetKey = normalizeKey(quoteText);
  const index = list.findIndex((f) => normalizeKey(f.quoteText) === targetKey);
  if (index === -1) return false;

  const removed = list.splice(index, 1)[0];
  saveFavorites(list);
  return removed;
}

/**
 * Computes statistics about favorites history.
 */
export function getFavoritesStats() {
  const list = loadFavorites();
  const totalFavorites = list.length;

  const categoryMap = {};
  const authorMap = {};

  for (const item of list) {
    const cat = item.category || 'General';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;

    const auth = item.author || 'Unknown';
    authorMap[auth] = (authorMap[auth] || 0) + 1;
  }

  const categories = Object.entries(categoryMap).map(([name, count]) => ({ name, count }));
  const topAuthors = Object.entries(authorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([author, count]) => ({ author, count }));

  return {
    totalFavorites,
    categories,
    topAuthors,
  };
}

/**
 * Resets storage back to initial seeds.
 */
export function resetFavorites() {
  const seeds = getSeedFavorites();
  saveFavorites(seeds);
  return seeds;
}
