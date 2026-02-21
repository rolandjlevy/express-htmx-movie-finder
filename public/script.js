const randomMovies = [
  '2001: A Space Odyssey',
  'Alien',
  'Apocalypse Now',
  'Avengers',
  'Batman',
  'Ben-Hur',
  'Casablanca',
  'Chinatown',
  'Citizen Kane',
  'Forrest Gump',
  'Godzilla',
  'Gone with the Wind',
  'Harry Potter',
  'Hulk',
  'Inception',
  'Iron Man',
  'James Bond',
  'Jaws',
  'Jurassic Park',
  'King Kong',
  'Lawrence of Arabia',
  'Lord of the Rings',
  'Mission Impossible',
  'My Fair Lady',
  'North by Northwest',
  'On the Waterfront',
  'Psycho',
  'Pulp Fiction',
  'Raging Bull',
  'Rear Window',
  'Rocky',
  'Roman Holiday',
  'Singin in the Rain',
  'Some Like It Hot',
  'Spider-Man',
  'Star Trek',
  'Star Wars',
  'Sunset Boulevard',
  'Superman',
  'Taxi Driver',
  'Terminator',
  'The Birds',
  'The Dark Knight',
  'The Exorcist',
  'The Godfather',
  'The Godfather Part II',
  'The Graduate',
  'The Maltese Falcon',
  'The Matrix',
  'The Sound of Music',
  'The Wizard of Oz',
  'Thor',
  'Transformers',
  'Vertigo',
  'West Side Story',
  'X-Men'
];

const toggleBtn = document.getElementById('themeToggle');
const root = document.documentElement;

// Initialize theme on page load
if (localStorage.theme !== 'light') {
  root.classList.add('dark');
}

toggleBtn.addEventListener('click', () => {
  const isDark = root.classList.toggle('dark');
  localStorage.theme = isDark ? 'dark' : 'light';
});

// Clear button
const clearBtn = document.getElementById('clearBtn');

clearBtn.addEventListener('click', () => {
  document.getElementById('movieTitle').value = '';
  document.getElementById('result').innerHTML = '';
});

// Random Movie button
const randomBtn = document.getElementById('randomBtn');
randomBtn.addEventListener('click', () => {
  // Pick a random movie from the list
  const pick = randomMovies[Math.floor(Math.random() * randomMovies.length)];
  // Set the input value
  document.getElementById('movieTitle').value = pick;
  // Trigger HTMX form submission programmatically
  document
    .querySelector('form')
    .dispatchEvent(new Event('submit', { cancelable: true }));
});

// Auto-update footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Activate Lucide Icons
document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line no-undef
  lucide.createIcons();
});

// Re-activate icons after HTMX content swap
document.body.addEventListener('htmx:afterSwap', () => {
  // eslint-disable-next-line no-undef
  lucide.createIcons();
});
