const toggleBtn = document.getElementById('themeToggle');
const root = document.documentElement;

// Load saved theme
if (localStorage.theme === 'dark') {
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

const randomMovies = [
  'Batman',
  'Superman',
  'Spider-Man',
  'Star Wars',
  'Star Trek',
  'Avengers',
  'Iron Man',
  'Thor',
  'Hulk',
  'X-Men',
  'Harry Potter',
  'Lord of the Rings',
  'James Bond',
  'Mission Impossible',
  'Transformers',
  'Jurassic Park',
  'Godzilla',
  'King Kong',
  'Rocky',
  'Terminator'
];

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
