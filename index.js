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

const validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

const hasValidPosterExtension = (posterUrl) => {
  return (
    !!posterUrl &&
    posterUrl !== 'N/A' &&
    validImageExtensions.some((ext) => posterUrl.toLowerCase().includes(ext))
  );
};

const isValidImageUrl = async (posterUrl) => {
  if (!hasValidPosterExtension(posterUrl)) {
    return false;
  }
  try {
    const response = await axios.head(posterUrl, { timeout: 5000 });
    return response.status === 200 && response.headers['content-length'] > 1000;
  } catch {
    return false;
  }
};

const getMovie = (movie) => {
  if (!hasValidPosterExtension(movie.Poster)) {
    return '';
  }
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
};

app.post('/search', async (req, res) => {
  const { movieTitle } = req.body;
  const encodedTitle = encodeURIComponent(movieTitle);
  const omdbRequestConfig = {
    timeout: 8000,
    validateStatus: (status) => status >= 200 && status < 300
  };

  try {
    // 1. Fetch search results (2 pages)
    const pages = [1, 2];
    const responses = await Promise.all(
      pages.map((page) =>
        axios.get(
          `https://www.omdbapi.com/?s=${encodedTitle}&page=${page}&apikey=${OMDB_API_KEY}`,
          omdbRequestConfig
        )
      )
    );

    const searchResults = responses
      .flatMap((r) => r.data?.Search ?? [])
      .slice(0, 20);

    const apiReturnedError = responses.find(
      (r) => r.data?.Response === 'False' && r.data?.Error
    );

    if (apiReturnedError) {
      return res.status(200).send(`
        <div
          id="errorMessage"
          class="mt-8 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
        >
          <div class="flex items-start gap-3">
            <i data-lucide="alert-circle" class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"></i>
            <div>
              <h3 class="font-semibold text-red-800 dark:text-red-300">Error</h3>
              <p id="errorText" class="text-red-700 dark:text-red-400 text-sm mt-1">Movie service error: ${apiReturnedError.data.Error}</p>
            </div>
          </div>
        </div>
      `);
    }

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
            `https://www.omdbapi.com/?i=${movie.imdbID}&plot=full&apikey=${OMDB_API_KEY}`,
            omdbRequestConfig
          )
          .then((r) => r.data)
      )
    );

    // 3. Filter out movies with invalid/missing images
    const validMovies = await Promise.all(
      detailedMovies.map(async (movie) => ({
        ...movie,
        isValidImage: await isValidImageUrl(movie.Poster)
      }))
    );

    const moviesWithValidImages = validMovies.filter((m) => m.isValidImage);

    if (!moviesWithValidImages.length) {
      return res.send(
        `<p class="text-center text-gray-600 dark:text-gray-300 text-lg">
          No results with valid images found for "<strong>${movieTitle}</strong>"
        </p>`
      );
    }

    // 4. Render the richer movie cards
    return res.send(`
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${moviesWithValidImages.map(getMovie).join('')}
      </div>
    `);
  } catch (error) {
    const errorMsg = error.response
      ? `Movie service returned ${error.response.status} ${error.response.statusText}`
      : error.request
        ? 'Movie service did not respond. Please try again in a moment.'
        : `Request failed: ${error.message}`;

    return res.status(200).send(`
        <div
        id="errorMessage"
        class="mt-8 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
      >
        <div class="flex items-start gap-3">
          <i data-lucide="alert-circle" class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"></i>
          <div>
            <h3 class="font-semibold text-red-800 dark:text-red-300">Error</h3>
            <p id="errorText" class="text-red-700 dark:text-red-400 text-sm mt-1">Error fetching OMDB movie data: ${errorMsg}</p>
          </div>
        </div>
      </div>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port:${PORT}`);
});
