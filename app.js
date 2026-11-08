/**
 * QuoteVerse - Public API Quote Generator with Favorites Database Storage
 * Client Application Logic
 */

// State
let currentQuote = {
  id: 'seeded-1',
  text: 'First, solve the problem. Then, write the code.',
  author: 'John Johnson',
  category: 'Technology',
  source: 'Curated Database',
  isFavorite: false
};
let favoritesList = [];
let selectedCategory = 'All';
let searchQuery = '';
let sortBy = 'newest';
let isSpeechPlaying = false;

// DOM Elements
const quoteTextEl = document.getElementById('quote-text');
const quoteAuthorEl = document.getElementById('quote-author');
const authorInitialsEl = document.getElementById('author-initials');
const quoteCategoryEl = document.getElementById('quote-category');
const quoteSourceEl = document.getElementById('quote-source');
const heroQuoteCardEl = document.getElementById('hero-quote-card');
const quoteTextContainer = document.getElementById('quote-text-container');

const btnNextQuote = document.getElementById('btn-next-quote');
const nextQuoteSpinner = document.getElementById('next-quote-spinner');
const btnCopyQuote = document.getElementById('btn-copy-quote');
const copyBtnText = document.getElementById('copy-btn-text');
const btnToggleFav = document.getElementById('btn-toggle-favorite');
const favBtnText = document.getElementById('fav-btn-text');
const favoriteHeartIcon = document.getElementById('favorite-heart-icon');
const btnReadAloud = document.getElementById('btn-read-aloud');
const btnShareX = document.getElementById('btn-share-x');

const navFavCount = document.getElementById('nav-fav-count');
const favCountPill = document.getElementById('fav-count-pill');
const favoritesGrid = document.getElementById('favorites-grid');
const favSearchInput = document.getElementById('fav-search-input');
const favSortSelect = document.getElementById('fav-sort-select');
const btnExportFavorites = document.getElementById('btn-export-favorites');
const toastContainer = document.getElementById('toast-container');

// Toast Notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-emerald-600/95 border-emerald-500 text-white',
    error: 'bg-rose-600/95 border-rose-500 text-white',
    info: 'bg-indigo-600/95 border-indigo-500 text-white'
  };
  const icons = {
    success: 'check-circle-2',
    error: 'alert-circle',
    info: 'info'
  };

  toast.className = `px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 text-xs font-semibold backdrop-blur-md pointer-events-auto transform translate-y-2 opacity-0 transition-all duration-300 ${bgColors[type] || bgColors.info}`;
  toast.innerHTML = `
    <i data-lucide="${icons[type] || 'info'}" class="w-4 h-4 flex-shrink-0"></i>
    <span class="flex-1">${escapeHtml(message)}</span>
  `;

  toastContainer.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-4');
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

// Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Get initials
function getInitials(name) {
  if (!name || name === 'Unknown') return '??';
  return name.split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Update Active Heart State on Hero Card
function updateHeroHeartState(isFav) {
  currentQuote.isFavorite = Boolean(isFav);
  if (currentQuote.isFavorite) {
    favBtnText.textContent = 'Favorited!';
    btnToggleFav.classList.add('bg-rose-500/20', 'text-rose-300', 'border-rose-500/40');
    btnToggleFav.classList.remove('bg-slate-800', 'text-slate-200');
    favoriteHeartIcon.classList.add('text-rose-400', 'fill-rose-400');
    favoriteHeartIcon.classList.remove('text-slate-400');
  } else {
    favBtnText.textContent = 'Add to Favorites';
    btnToggleFav.classList.remove('bg-rose-500/20', 'text-rose-300', 'border-rose-500/40');
    btnToggleFav.classList.add('bg-slate-800', 'text-slate-200');
    favoriteHeartIcon.classList.remove('text-rose-400', 'fill-rose-400');
    favoriteHeartIcon.classList.add('text-slate-400');
  }
}

// Render Current Quote to UI
function renderCurrentQuote(quote) {
  currentQuote = { ...quote };

  // Animate text change
  quoteTextContainer.classList.remove('animate-quote-in');
  void quoteTextContainer.offsetWidth; // Trigger reflow
  quoteTextContainer.classList.add('animate-quote-in');

  quoteTextEl.textContent = `"${quote.text}"`;
  quoteAuthorEl.textContent = quote.author || 'Unknown';
  authorInitialsEl.textContent = getInitials(quote.author);
  quoteCategoryEl.textContent = quote.category || 'Inspiration';
  quoteSourceEl.querySelector('span').textContent = quote.source || 'Public API';

  updateHeroHeartState(quote.isFavorite);
  if (window.lucide) lucide.createIcons();
}

// Fetch Random Quote from Backend / Public API
async function fetchRandomQuote(cat = selectedCategory) {
  setFetchingState(true);
  try {
    const url = cat && cat !== 'All' 
      ? `/api/quotes/random?category=${encodeURIComponent(cat)}`
      : '/api/quotes/random';

    const res = await fetch(url);
    const data = await res.json();

    if (data.success && data.quote) {
      renderCurrentQuote(data.quote);
    } else {
      showToast('Could not fetch new quote, fallback activated', 'error');
    }
  } catch (err) {
    console.error('Fetch error:', err);
    showToast('Offline fallback quote active', 'info');
  } finally {
    setFetchingState(false);
  }
}

function setFetchingState(isLoading) {
  btnNextQuote.disabled = isLoading;
  if (isLoading) {
    nextQuoteSpinner.classList.add('animate-spin');
  } else {
    nextQuoteSpinner.classList.remove('animate-spin');
  }
}

// Fetch Favorites from Backend Database
async function fetchFavorites() {
  try {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);

    const res = await fetch(`/api/favorites?${params.toString()}`);
    const data = await res.json();

    if (data.success) {
      favoritesList = data.favorites || [];
      renderFavoritesList();
      updateFavoriteCounters(favoritesList.length);

      // Re-verify current quote favorite status
      if (currentQuote && currentQuote.text) {
        const isFav = favoritesList.some(f => 
          f.text.toLowerCase().trim() === currentQuote.text.toLowerCase().trim()
        );
        updateHeroHeartState(isFav);
      }
    }
  } catch (err) {
    console.error('Failed to load favorites:', err);
    favoritesGrid.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-500">
        <p class="text-sm text-rose-400">Failed to load favorites from database.</p>
        <button onclick="fetchFavorites()" class="mt-2 text-xs text-indigo-400 underline">Try again</button>
      </div>
    `;
  }
}

// Update Counters in Navbar and Section Header
function updateFavoriteCounters(count) {
  navFavCount.textContent = count;
  favCountPill.textContent = `${count} Saved`;
}

// Render Favorites Grid
function renderFavoritesList() {
  if (!favoritesList || favoritesList.length === 0) {
    favoritesGrid.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
        <i data-lucide="bookmark" class="w-10 h-10 mx-auto mb-2 text-slate-600"></i>
        <p class="text-sm font-semibold text-slate-400">No favorite quotes found</p>
        <p class="text-xs text-slate-500 mt-1">Click the heart button above to save your favorite quotes to the database.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  // Sorting
  let sorted = [...favoritesList];
  if (sortBy === 'newest') {
    sorted.sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0));
  } else if (sortBy === 'oldest') {
    sorted.sort((a, b) => new Date(a.savedAt || 0) - new Date(b.savedAt || 0));
  } else if (sortBy === 'author') {
    sorted.sort((a, b) => (a.author || '').localeCompare(b.author || ''));
  }

  favoritesGrid.innerHTML = sorted.map(fav => `
    <div class="favorite-item bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group hover:shadow-lg hover:shadow-slate-900/50" data-id="${fav.id}">
      <div>
        <div class="flex items-center justify-between gap-2 mb-3">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
            ${escapeHtml(fav.category || 'Inspiration')}
          </span>
          <span class="text-[10px] text-slate-500">${formatDate(fav.savedAt)}</span>
        </div>
        <p class="text-sm font-serif italic text-slate-200 leading-relaxed">
          "${escapeHtml(fav.text)}"
        </p>
      </div>

      <div class="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300 flex items-center justify-center">
            ${getInitials(fav.author)}
          </div>
          <span class="text-xs font-semibold text-slate-300">${escapeHtml(fav.author || 'Unknown')}</span>
        </div>

        <div class="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
          <!-- Copy single favorite -->
          <button type="button" class="btn-copy-card p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors" title="Copy Quote" data-text="${escapeHtml(fav.text)}" data-author="${escapeHtml(fav.author)}">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
          </button>

          <!-- Delete single favorite -->
          <button type="button" class="btn-delete-card p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors" title="Remove from Favorites" data-id="${fav.id}">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function formatDate(dateStr) {
  if (!dateStr) return 'Recently';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Recently';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Copy to Clipboard (Workora Deliverable)
async function copyCurrentQuote() {
  const quoteString = `"${currentQuote.text}" — ${currentQuote.author}`;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(quoteString);
    } else {
      // Fallback for non-https or older browsers
      const textArea = document.createElement('textarea');
      textArea.value = quoteString;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }

    // Visual Feedback
    const origText = copyBtnText.textContent;
    copyBtnText.textContent = 'Copied to Clipboard!';
    btnCopyQuote.classList.add('bg-emerald-600', 'text-white', 'border-emerald-500');
    btnCopyQuote.classList.remove('bg-slate-800', 'text-slate-200');

    showToast('Quote copied to clipboard!', 'success');

    setTimeout(() => {
      copyBtnText.textContent = origText;
      btnCopyQuote.classList.remove('bg-emerald-600', 'text-white', 'border-emerald-500');
      btnCopyQuote.classList.add('bg-slate-800', 'text-slate-200');
    }, 2000);

  } catch (err) {
    console.error('Clipboard copy failed:', err);
    showToast('Failed to copy quote', 'error');
  }
}

// Toggle Favorite on Hero Quote
async function toggleHeroFavorite() {
  try {
    const payload = {
      text: currentQuote.text,
      author: currentQuote.author,
      category: currentQuote.category,
      source: currentQuote.source
    };

    const res = await fetch('/api/favorites/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      updateHeroHeartState(data.isFavorite);
      if (data.isFavorite) {
        showToast('Saved quote to favorites database!', 'success');
      } else {
        showToast('Removed quote from favorites', 'info');
      }
      // Refresh favorites history list
      fetchFavorites();
    } else {
      showToast(data.message || 'Error updating favorite', 'error');
    }
  } catch (err) {
    console.error('Toggle favorite failed:', err);
    showToast('Database update failed', 'error');
  }
}

// Delete Favorite by ID
async function deleteFavoriteById(id) {
  try {
    const res = await fetch(`/api/favorites/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('Quote removed from favorites', 'info');
      fetchFavorites();
    } else {
      showToast(data.message || 'Delete failed', 'error');
    }
  } catch (err) {
    console.error('Delete error:', err);
    showToast('Failed to delete favorite', 'error');
  }
}

// Read Aloud using Web Speech Synthesis API
function toggleSpeechSynthesis() {
  if (!('speechSynthesis' in window)) {
    showToast('Text-to-speech not supported in this browser', 'info');
    return;
  }

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    isSpeechPlaying = false;
    btnReadAloud.classList.remove('bg-indigo-600', 'text-white');
    return;
  }

  const textToRead = `${currentQuote.text}. By ${currentQuote.author}.`;
  const utterance = new SpeechSynthesisUtterance(textToRead);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    isSpeechPlaying = true;
    btnReadAloud.classList.add('bg-indigo-600', 'text-white');
  };

  utterance.onend = utterance.onerror = () => {
    isSpeechPlaying = false;
    btnReadAloud.classList.remove('bg-indigo-600', 'text-white');
  };

  window.speechSynthesis.speak(utterance);
}

// Share on X (Twitter)
function shareQuoteOnX() {
  const text = `"${currentQuote.text}" — ${currentQuote.author}`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&hashtags=Quotes,Inspiration`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

// Export Favorites JSON
function exportFavoritesJson() {
  if (!favoritesList || favoritesList.length === 0) {
    showToast('No favorites to export', 'info');
    return;
  }
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(favoritesList, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `quoteverse_favorites_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Favorites exported as JSON', 'success');
}

// Switch Card Gradient Theme
function setupThemeButtons() {
  const themeButtons = document.querySelectorAll('.theme-btn');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      heroQuoteCardEl.classList.remove('theme-dark', 'theme-sunset', 'theme-emerald', 'theme-cyberpunk');
      heroQuoteCardEl.classList.add(`theme-${theme}`);
    });
  });
}

// Category Chips Selection
function setupCategoryChips() {
  const chips = document.querySelectorAll('.category-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => {
        c.classList.remove('bg-indigo-600', 'text-white');
        c.classList.add('bg-slate-800', 'text-slate-300', 'border', 'border-slate-700');
      });
      chip.classList.add('bg-indigo-600', 'text-white');
      chip.classList.remove('bg-slate-800', 'text-slate-300', 'border', 'border-slate-700');

      selectedCategory = chip.dataset.cat;
      fetchRandomQuote(selectedCategory);
      fetchFavorites();
    });
  });
}

// Event Listeners
function setupEventListeners() {
  btnNextQuote.addEventListener('click', () => fetchRandomQuote());
  btnCopyQuote.addEventListener('click', copyCurrentQuote);
  btnToggleFav.addEventListener('click', toggleHeroFavorite);
  btnReadAloud.addEventListener('click', toggleSpeechSynthesis);
  btnShareX.addEventListener('click', shareQuoteOnX);

  // Search input debounce
  let searchTimeout;
  favSearchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = e.target.value;
      fetchFavorites();
    }, 250);
  });

  // Sort select
  favSortSelect.addEventListener('change', (e) => {
    sortBy = e.target.value;
    renderFavoritesList();
  });

  // Export
  btnExportFavorites.addEventListener('click', exportFavoritesJson);

  // Delegate Favorites Grid click events (Copy & Delete)
  favoritesGrid.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.btn-copy-card');
    if (copyBtn) {
      const text = copyBtn.dataset.text;
      const author = copyBtn.dataset.author;
      const str = `"${text}" — ${author}`;
      navigator.clipboard.writeText(str).then(() => {
        showToast('Quote copied to clipboard!', 'success');
      });
      return;
    }

    const deleteBtn = e.target.closest('.btn-delete-card');
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      deleteFavoriteById(id);
      return;
    }
  });

  setupCategoryChips();
  setupThemeButtons();
}

// App Initialization
async function initApp() {
  setupEventListeners();
  if (window.lucide) lucide.createIcons();

  // Load initial quotes and favorites
  await Promise.all([
    fetchRandomQuote(),
    fetchFavorites()
  ]);
}

// Launch
document.addEventListener('DOMContentLoaded', initApp);
