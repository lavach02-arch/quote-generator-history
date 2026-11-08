import app from './app.js';

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(`  Quote Generator with History Server Running!`);
  console.log(`  URL:          http://localhost:${PORT}`);
  console.log(`  Health:       http://localhost:${PORT}/api/health`);
  console.log(`  Random Quote: http://localhost:${PORT}/api/quotes/random`);
  console.log(`  Favorites:    http://localhost:${PORT}/api/favorites`);
  console.log(`========================================================`);
});
