const express = require("express");
const path = require('path');
const app = express();
require('dotenv').config();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log({ OMDB_API_KEY })

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'movie-finder.html'));
});

app.post('/search', async (req, res) => {
  const { movieTitle } = req.body;

  try {
    const omdbUrl = `http://www.omdbapi.com/?t=${encodeURIComponent(movieTitle)}&apikey=${OMDB_API_KEY}`;
    const response = await axios.get(omdbUrl);
    const movieData = response.data;

    if (movieData.Response === 'True') {
      res.send(`
        <h2>${movieData.Title}</h2>
        <img src="${movieData.Poster}" alt="${movieData.Title} Poster">
        <p>${movieData.Plot}</p>
      `);
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
