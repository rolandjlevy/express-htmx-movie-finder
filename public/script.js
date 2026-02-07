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

// Auto-update footer year
document.getElementById('year').textContent = new Date().getFullYear();
