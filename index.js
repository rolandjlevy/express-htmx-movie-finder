const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.disable('x-powered-by');

const { PORT = 3000, OMDB_API_KEY } = process.env;

const MIN_QUERY_LENGTH = 3;
const MAX_QUERY_LENGTH = 100;
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ENTRIES = 200;

app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'movie-finder.html'));
});

/* ---------- helpers ---------- */

const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\x27': '&#39;'
};

// Every value that came from the user or from OMDb goes through esc().
const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

const hasValue = (value) => Boolean(value) && value !== 'N/A';

const cache = new Map();

const cacheGet = (key) => {
  const hit = cache.get(key);
  if (!hit) {
    return null;
  }
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.html;
};

const cacheSet = (key, html) => {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    cache.delete(cache.keys().next().value);
  }
  cache.set(key, { html, at: Date.now() });
};

const omdb = (params) =>
  axios.get('https://www.omdbapi.com/', {
    params: { ...params, apikey: OMDB_API_KEY },
    timeout: 6000
  });

const icons = {
  film: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18"></rect><path d="M7 2v20"></path><path d="M17 2v20"></path><path d="M2 12h20"></path><path d="M2 7h5"></path><path d="M2 17h5"></path><path d="M17 17h5"></path><path d="M17 7h5"></path></svg>',
  star: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>',
  chevron:
    '<svg class="chev" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>',
  alert:
    '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>'
};

/* ---------- HTML fragments ---------- */

// Updates the polite live region that sits above the results.
const statusOob = (text) =>
  `<div id="status" hx-swap-oob="innerHTML">${esc(text)}</div>`;

const notice = (title, body, actionHtml = '') => `
  <div class="notice">
    <h2>${esc(title)}</h2>
    <p>${esc(body)}</p>
    ${actionHtml}
  </div>
`;

const noResults = (query) =>
  notice(
    `No films found for “${query}”`,
    'Check the spelling, or try fewer words. Searching for just the first word of a title often works.',
    '<button type="button" class="btn btn-secondary" data-clear>Clear search</button>'
  ) + statusOob('No films found.');

const tooShort = () => statusOob(`Type at least ${MIN_QUERY_LENGTH} letters.`);

const tooMany = () =>
  notice(
    'That search is too broad',
    'Add another word from the title to narrow it down.'
  ) + statusOob('Too many matches.');

const serviceProblem = () => `
  <div class="notice notice-error" role="alert">
    <h2>${icons.alert}Film search is busy</h2>
    <p>We can’t reach the film database right now. Your search is still in the box, so try again in a minute.</p>
    <button type="button" class="btn btn-primary" data-retry>Try again</button>
  </div>
  ${statusOob('Film search is busy.')}
`;

const renderChips = (genre) => {
  if (!hasValue(genre)) {
    return '';
  }
  const items = genre.split(', ').map((g) => `<li>${esc(g)}</li>`);
  return `<ul class="chips">${items.join('')}</ul>`;
};

const renderDetailRows = (movie) =>
  [
    ['Director', movie.Director],
    ['Starring', movie.Actors],
    ['Released', movie.Released],
    ['Language', movie.Language],
    ['Country', movie.Country],
    ['Awards', movie.Awards]
  ]
    .filter(([, value]) => hasValue(value))
    .map(([label, value]) => `<dt>${label}</dt><dd>${esc(value)}</dd>`)
    .join('');

const renderCard = (movie, index) => {
  const title = esc(movie.Title);
  const imdbUrl = `https://www.imdb.com/title/${encodeURIComponent(movie.imdbID)}/`;
  const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.Title} trailer`)}`;
  const meta = [movie.Year, hasValue(movie.Runtime) ? movie.Runtime : null]
    .filter(Boolean)
    .map(esc)
    .join(' · ');
  const poster = /^https?:\/\//i.test(movie.Poster || '')
    ? `<img src="${esc(movie.Poster)}" alt="" width="300" height="450" loading="lazy" decoding="async" referrerpolicy="no-referrer">`
    : '';
  const rating = hasValue(movie.imdbRating)
    ? `<p class="rating">${icons.star}<strong>${esc(movie.imdbRating)}</strong> <span>IMDb rating</span></p>`
    : '';
  const plot = hasValue(movie.Plot)
    ? `<p class="plot">${esc(movie.Plot)}</p>`
    : '';
  const detailRows = renderDetailRows(movie);
  const moreDetails = detailRows
    ? `<details class="more"><summary>More details${icons.chevron}</summary><dl>${detailRows}</dl></details>`
    : '';

  return `
    <li style="--n: ${index}">
      <article class="card">
        <div class="card-top">
          <div class="poster">${icons.film}${poster}</div>
          <div class="card-head">
            <h2>${title}</h2>
            <p class="meta">${meta}</p>
            ${rating}
            ${renderChips(movie.Genre)}
          </div>
        </div>
        ${plot}
        <p class="card-links">
          <a href="${imdbUrl}" target="_blank" rel="noopener noreferrer">View on IMDb<span class="sr-only"> (opens in a new tab)</span></a>
          <a href="${esc(trailerUrl)}" target="_blank" rel="noopener noreferrer">Watch trailer<span class="sr-only"> (opens in a new tab)</span></a>
        </p>
        ${moreDetails}
      </article>
    </li>
  `;
};

const renderResults = (query, movies) => {
  const count = movies.length === 1 ? '1 film' : `${movies.length} films`;
  return (
    `<ul class="film-list">${movies.map((m, i) => renderCard(m, i)).join('')}</ul>` +
    statusOob(`${count} for “${query}”`)
  );
};

/* ---------- search ---------- */

const findFilms = async (query) => {
  const searchResponse = await omdb({ s: query, type: 'movie', page: 1 });
  const { Response, Error: omdbError, Search } = searchResponse.data;

  if (Response === 'False') {
    if (omdbError === 'Movie not found!') {
      return { movies: [] };
    }
    if (omdbError === 'Too many results.') {
      return { tooMany: true };
    }
    return { failed: true };
  }

  // One detail call per film (at most 10), run in parallel. A film whose
  // detail call fails is skipped rather than failing the whole search.
  const details = await Promise.allSettled(
    Search.map((film) => omdb({ i: film.imdbID, plot: 'short' }))
  );
  const movies = details
    .filter((d) => d.status === 'fulfilled' && d.value.data.Response === 'True')
    .map((d) => d.value.data);

  if (!movies.length) {
    return { failed: true };
  }
  return { movies };
};

app.get('/search', async (req, res) => {
  const query = String(req.query.q ?? '')
    .trim()
    .slice(0, MAX_QUERY_LENGTH);

  if (!query) {
    return res.send(statusOob(''));
  }
  if (query.length < MIN_QUERY_LENGTH) {
    return res.send(tooShort());
  }

  const cacheKey = query.toLowerCase();
  const cached = cacheGet(cacheKey);
  if (cached) {
    return res.send(cached);
  }

  try {
    const outcome = await findFilms(query);

    if (outcome.failed) {
      return res.send(serviceProblem());
    }
    if (outcome.tooMany) {
      return res.send(tooMany());
    }

    const html = outcome.movies.length
      ? renderResults(query, outcome.movies)
      : noResults(query);
    cacheSet(cacheKey, html);
    return res.send(html);
  } catch (error) {
    console.error('OMDb request failed:', error.message);
    return res.send(serviceProblem());
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port:${PORT}`);
});
