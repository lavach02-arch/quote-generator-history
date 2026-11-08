/**
 * Quote Service - Fetches random/daily quotes from external public APIs
 * with an extensive curated fallback pool to guarantee 100% uptime and offline reliability.
 */

export const CURATED_QUOTES = [
  {
    quoteText: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
    category: 'Success',
    tags: ['work', 'passion', 'success'],
  },
  {
    quoteText: 'Simplicity is the soul of efficiency.',
    author: 'Austin Freeman',
    category: 'Technology',
    tags: ['code', 'engineering', 'simplicity'],
  },
  {
    quoteText: 'In the middle of difficulty lies opportunity.',
    author: 'Albert Einstein',
    category: 'Wisdom',
    tags: ['adversity', 'opportunity', 'science'],
  },
  {
    quoteText: 'It does not matter how slowly you go as long as you do not stop.',
    author: 'Confucius',
    category: 'Perseverance',
    tags: ['patience', 'growth', 'perseverance'],
  },
  {
    quoteText: 'First, solve the problem. Then, write the code.',
    author: 'John Johnson',
    category: 'Technology',
    tags: ['programming', 'software', 'problem-solving'],
  },
  {
    quoteText: 'Knowledge speaks, but wisdom listens.',
    author: 'Jimi Hendrix',
    category: 'Wisdom',
    tags: ['listening', 'learning', 'wisdom'],
  },
  {
    quoteText: 'The best way to predict the future is to invent it.',
    author: 'Alan Kay',
    category: 'Innovation',
    tags: ['future', 'innovation', 'technology'],
  },
  {
    quoteText: 'Happiness is not something ready made. It comes from your own actions.',
    author: 'Dalai Lama',
    category: 'Philosophy',
    tags: ['happiness', 'mindset', 'philosophy'],
  },
  {
    quoteText: 'Make it work, make it right, make it fast.',
    author: 'Kent Beck',
    category: 'Technology',
    tags: ['coding', 'craftsmanship', 'engineering'],
  },
  {
    quoteText: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    author: 'Winston Churchill',
    category: 'Success',
    tags: ['courage', 'resilience', 'success'],
  },
  {
    quoteText: 'Do what you can, with what you have, where you are.',
    author: 'Theodore Roosevelt',
    category: 'Inspiration',
    tags: ['action', 'resourcefulness', 'motivation'],
  },
  {
    quoteText: 'Premature optimization is the root of all evil in programming.',
    author: 'Donald Knuth',
    category: 'Technology',
    tags: ['performance', 'architecture', 'software'],
  },
  {
    quoteText: 'Act as if what you do makes a difference. It does.',
    author: 'William James',
    category: 'Inspiration',
    tags: ['impact', 'purpose', 'belief'],
  },
  {
    quoteText: 'Code is like humor. When you have to explain it, it’s bad.',
    author: 'Cory House',
    category: 'Technology',
    tags: ['clean-code', 'readability', 'engineering'],
  },
  {
    quoteText: 'The mind is everything. What you think you become.',
    author: 'Buddha',
    category: 'Philosophy',
    tags: ['mindset', 'thought', 'philosophy'],
  },
  {
    quoteText: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    author: 'Martin Fowler',
    category: 'Technology',
    tags: ['clean-code', 'maintainability', 'human-centered'],
  },
  {
    quoteText: 'Believe you can and you’re halfway there.',
    author: 'Theodore Roosevelt',
    category: 'Inspiration',
    tags: ['confidence', 'mindset', 'goals'],
  },
  {
    quoteText: 'Talk is cheap. Show me the code.',
    author: 'Linus Torvalds',
    category: 'Technology',
    tags: ['action', 'open-source', 'linux'],
  },
  {
    quoteText: 'Doubt kills more dreams than failure ever will.',
    author: 'Suzy Kassem',
    category: 'Wisdom',
    tags: ['confidence', 'dreams', 'fear'],
  },
  {
    quoteText: 'Stay hungry, stay foolish.',
    author: 'Whole Earth Catalog',
    category: 'Inspiration',
    tags: ['curiosity', 'humility', 'learning'],
  },
];

export const CATEGORIES = [
  'All',
  'Technology',
  'Wisdom',
  'Success',
  'Inspiration',
  'Philosophy',
  'Innovation',
  'Perseverance',
];

/**
 * Fetches a random quote, trying external API first with timeout, falling back gracefully to curated pool.
 * @param {string} [category]
 * @returns {Promise<{ quoteText: string, author: string, category: string, tags: string[], source: string }>}
 */
export async function fetchRandomQuote(category = '') {
  // If specific category requested or if testing offline, try matching pool first
  let pool = CURATED_QUOTES;
  if (category && category !== 'All') {
    const filtered = CURATED_QUOTES.filter(
      (q) => q.category.toLowerCase() === category.toLowerCase()
    );
    if (filtered.length > 0) pool = filtered;
  }

  // Pick candidate from pool as dependable fallback
  const fallbackQuote = pool[Math.floor(Math.random() * pool.length)];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800); // 1.8s timeout

    const res = await fetch('https://dummyjson.com/quotes/random', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.quote && data.author) {
        return {
          quoteText: data.quote.trim(),
          author: data.author.trim(),
          category: category || 'Wisdom',
          tags: ['daily', 'inspirational', 'public-api'],
          source: 'DummyJSON Public Quotes API',
        };
      }
    }
  } catch (err) {
    // Graceful fallback on network timeout/offline
  }

  return {
    ...fallbackQuote,
    source: 'Curated Knowledge Base',
  };
}

/**
 * Deterministically retrieves the Quote of the Day based on current date.
 */
export function getQuoteOfTheDay() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
  );
  const index = Math.abs(dayOfYear) % CURATED_QUOTES.length;
  return {
    ...CURATED_QUOTES[index],
    isDaily: true,
    source: 'Daily Inspiration Engine',
  };
}
