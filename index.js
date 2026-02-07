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

const getMovie = (movie) => {
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

app.post('/search', async (req, res) => {
  const { movieTitle } = req.body;
  const encodedTitle = encodeURIComponent(movieTitle);

  try {
    const omdbUrl = `http://www.omdbapi.com/?s=${encodedTitle}&apikey=${OMDB_API_KEY}`;
    const response = await axios.get(omdbUrl);
    const movieData = response.data;

    const pages = [1, 2];
    const responses = await Promise.all(
      pages.map((page) =>
        axios.get(
          `http://www.omdbapi.com/?s=${encodedTitle}&page=${page}&apikey=${OMDB_API_KEY}`
        )
      )
    );
    const movies = responses.flatMap((r) => r.data?.Search ?? []).slice(0, 20);

    if (!movies.length) {
      return res.send(
        ` <p class="text-center text-gray-600 dark:text-gray-300 text-lg"> No results found for "<strong>${movieTitle}</strong>" </p> `
      );
    }
    res.send(
      ` <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"> ${movies.map(getMovie).join('')} </div> `
    );
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
