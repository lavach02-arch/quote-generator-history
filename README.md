# QuoteVerse - Quote Generator with Favorites History

> **Workora Project Milestone Submission**  
> Build an application that fetches random quotes from a public API and saves favorited quotes to a backend database.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-lavach02--arch-purple.svg)](https://github.com/lavach02-arch)

---

## 🎯 Deliverables & Requirements Checklist

| Requirement | Implementation Details | Status |
|---|---|:---:|
| **1. Fetch daily/random quotes from external API** | Integrated with `https://dummyjson.com/quotes/random` + curated fallback cache for 100% offline uptime | ✅ Complete |
| **2. Backend database table for favorite quotes** | Atomic persistent JSON storage (`backend/data/favorites.json` & `/tmp` on serverless) with duplicate prevention | ✅ Complete |
| **3. Render favorites history list on frontend** | Real-time dynamic favorites grid with categories, search filter, and sorting | ✅ Complete |
| **4. Copy-to-clipboard functionality** | `navigator.clipboard.writeText` with visual button feedback and toast notifications | ✅ Complete |

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Run Automated Test Suite
```bash
npm test
```
*All 14 automated tests pass verifying public API integration, database persistence, deduplication, search, and delete.*

### 3. Start the Server
```bash
npm start
```
Open your browser at `http://localhost:5003`.

---

## 🌐 Deploy to Vercel (1-Click)

1. Push this repository to GitHub: `https://github.com/lavach02-arch/quote-generator-history`
2. Open **[vercel.com/new](https://vercel.com/new)**
3. Select `quote-generator-history` and click **Deploy**.
4. The application is live immediately with static edge CDN and serverless backend API!

---

## 📡 REST API Documentation

- `GET /api/quotes/random` - Fetch random quote from public API with fallback
- `GET /api/quotes/daily` - Fetch quote of the day
- `GET /api/quotes/categories` - List available quote categories
- `GET /api/favorites` - Get all saved favorites (supports `?search=` and `?category=`)
- `POST /api/favorites` - Save quote to favorites database
- `POST /api/favorites/toggle` - Toggle favorite status
- `DELETE /api/favorites/:id` - Remove quote from favorites
- `GET /api/stats` - Summary statistics
