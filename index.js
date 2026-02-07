const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();
require('dotenv').config();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { PORT, OMDB_API_KEY } = process.env;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'movie-finder.html'));
});

const getMovieSimple = (movie) => {
  return `
    <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      <a href="https://www.imdb.com/title/${movie.imdbID}" target="_blank">
        <img src="${movie.Poster}" alt="${movie.Title} Poster" class="w-full h-80 object-cover" />
      </a>
      <div class="p-4">
        <h3 class="text-lg font-semibold text-gray-800">${movie.Title}</h3>
        <p class="text-gray-500">${movie.Year}</p>
      </div>
    </div>
  `;
};

function getMovie(movie) {
  const runtime =
    movie?.Runtime !== 'N/A'
      ? `<span class="mx-1">•</span>${movie.Runtime}`
      : '';

  const rating =
    movie?.imdbRating !== 'N/A'
      ? `
        <div class="flex items-center gap-1 text-gray-700 dark:text-gray-300 text-sm font-medium mt-1">
          <i data-lucide="star" class="w-4 h-4 text-yellow-400"></i>
          <span>${movie.imdbRating}</span>
        </div>
      `
      : '';

  const genres =
    movie?.Genre !== 'N/A'
      ? `
        <div class="flex flex-wrap text-gray-700 dark:text-gray-300 gap-1 mt-2">
          ${movie.Genre.split(', ')
            .map(
              (g) => `
            <span class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              ${g}
            </span>
          `
            )
            .join('')}
        </div>
      `
      : '';

  const actors =
    movie?.Actors !== 'N/A'
      ? `
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
          <strong>Starring:</strong> ${movie.Actors.split(', ')
            .slice(0, 3)
            .join(', ')}
        </p>
      `
      : '';

  const awards =
    movie.Awards &&
    movie.Awards !== 'N/A' &&
    !movie.Awards.toLowerCase().includes('n/a')
      ? `
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          🏆 ${movie.Awards}
        </p>
      `
      : '';

  const released =
    movie.Released && movie.Released !== 'N/A'
      ? `
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Released: ${movie.Released}
        </p>
      `
      : '';

  return `
    <div class="movie-card bg-surface-light dark:bg-surface-dark rounded-lg p-4 shadow-sm flex flex-col">
      
      <img
        src="${movie.Poster}"
        alt="${movie.Title} poster"
        class="w-full h-64 object-cover rounded mb-3"
      />

      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">${movie.Title}</h3>

      <p class="text-sm text-gray-500 dark:text-gray-400">
        ${movie.Year}
        ${runtime}
      </p>

      ${rating}
      ${genres}
      ${actors}
      ${awards}
      ${released}

      <p class="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
        ${movie.Plot}
      </p>

      <a
        href="https://www.imdb.com/title/${movie.imdbID}"
        target="_blank"
        class="mt-2 inline-block text-primary text-sm hover:underline"
      >
        View on IMDb →
      </a>

      <a
        href="https://www.youtube.com/results?search_query=${encodeURIComponent(
          movie.Title + ' trailer'
        )}"
        target="_blank"
        class="mt-2 inline-block text-primary text-sm hover:underline"
      >
        Watch trailer →
      </a>

      <details class="mt-3">
        <summary class="cursor-pointer text-primary text-sm">More details</summary>
        <div class="mt-2 text-sm text-gray-700 dark:text-gray-300">
          <p><strong>Director:</strong> ${movie.Director}</p>
          <p><strong>Writer:</strong> ${movie.Writer}</p>
          <p><strong>Language:</strong> ${movie.Language}</p>
          <p><strong>Country:</strong> ${movie.Country}</p>
        </div>
      </details>

    </div>
  `;
}

app.post('/search', async (req, res) => {
  const { movieTitle } = req.body;
  const encodedTitle = encodeURIComponent(movieTitle);

  try {
    // 1. Fetch search results (2 pages)
    const pages = [1, 2];
    const responses = await Promise.all(
      pages.map((page) =>
        axios.get(
          `https://www.omdbapi.com/?s=${encodedTitle}&page=${page}&apikey=${OMDB_API_KEY}`
        )
      )
    );

    const searchResults = responses
      .flatMap((r) => r.data?.Search ?? [])
      .slice(0, 20);

    if (!searchResults.length) {
      return res.send(
        `<p class="text-center text-gray-600 dark:text-gray-300 text-lg">
          No results found for "<strong>${movieTitle}</strong>"
        </p>`
      );
    }

    // 2. Fetch full details for each movie using imdbID
    const detailedMovies = await Promise.all(
      searchResults.map((movie) =>
        axios
          .get(
            `https://www.omdbapi.com/?i=${movie.imdbID}&plot=full&apikey=${OMDB_API_KEY}`
          )
          .then((r) => r.data)
      )
    );

    // 3. Render the richer movie cards
    res.send(`
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        ${detailedMovies.map(getMovie).join('')}
      </div>
    `);
  } catch (error) {
    console.error('Error fetching movie data:', error.message);
    res.status(500).send(`
      <p class="text-red-600 text-center font-semibold">
        Server Error! Unable to fetch movie data.
      </p>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port:${PORT}`);
});
