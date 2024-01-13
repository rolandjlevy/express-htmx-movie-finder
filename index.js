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

app.post('/search', async (req, res) => {
  const { movieTitle } = req.body;

  try {
    const omdbUrl = `http://www.omdbapi.com/?s=${encodeURIComponent(movieTitle)}&apikey=${OMDB_API_KEY}`;
    const response = await axios.get(omdbUrl);
    const movieData = response.data;
    if (movieData.Response === 'True') {
      const movies = movieData.Search.map(item => {
        // json data -> http://www.omdbapi.com/?i=${item.imdbID}&apikey=${OMDB_API_KEY}
        return `
          <section>
            <h2>${item.Title}, ${item.Year}</h2>
            <p><a href="https://www.imdb.com/title/${item.imdbID}" target="_blank">Link</a></p>
            <img src="${item.Poster}" alt="${item.Title} Poster">
          </section>
        `;
      }).join('');
      res.send(`<article class="movies">${movies}</article>`);
    } else {
      res.send(`<p>No results found for "${movieTitle}".</p>`);
    }
  } catch (error) {
    console.error('Error fetching movie data:', error.message);
    res.status(500).send('Server Error! Unable to fetch movie data.');
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port:${PORT}`);
});
