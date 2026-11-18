/* global htmx */
(() => {
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

  const root = document.documentElement;
  const form = document.getElementById('searchForm');
  const input = document.getElementById('q');
  const result = document.getElementById('result');
  const status = document.getElementById('status');
  const themeToggle = document.getElementById('themeToggle');
  const flowType = document.getElementById('flowType');
  const flowServer = document.getElementById('flowServer');
  const flowSwap = document.getElementById('flowSwap');
  const flowQ = document.getElementById('flowQ');
  const reqPath = document.getElementById('reqPath');
  const reqStatus = document.getElementById('reqStatus');
  const reqSize = document.getElementById('reqSize');

  /* ---------- theme ---------- */
  const applyTheme = (dark) => {
    root.classList.toggle('dark', dark);
    themeToggle.setAttribute(
      'aria-label',
      dark ? 'Switch to light theme' : 'Switch to dark theme'
    );
  };

  applyTheme(root.classList.contains('dark'));

  themeToggle.addEventListener('click', () => {
    const dark = !root.classList.contains('dark');
    applyTheme(dark);
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch {
      /* storage blocked: the choice just won't persist */
    }
  });

  /* ---------- search helpers ---------- */
  const searchFor = (title) => {
    input.value = title;
    input.focus();
    form.requestSubmit();
  };

  const clearSearch = () => {
    input.value = '';
    result.innerHTML = '';
    status.textContent = '';
    history.replaceState(null, '', '/');
    input.focus();
  };

  // One delegated listener, so it keeps working for content htmx swaps in.
  document.addEventListener('click', (event) => {
    const target = event.target.closest(
      '[data-q], [data-clear], [data-retry], [data-copy], #randomBtn, #clearBtn'
    );
    if (!target) {
      return;
    }

    if (target.dataset.q) {
      searchFor(target.dataset.q);
    } else if (target.id === 'randomBtn') {
      searchFor(randomMovies[Math.floor(Math.random() * randomMovies.length)]);
    } else if (target.id === 'clearBtn' || target.dataset.clear !== undefined) {
      clearSearch();
    } else if (target.dataset.retry !== undefined) {
      form.requestSubmit();
    } else if (target.dataset.copy) {
      copyCode(target);
    }
  });

  const copyCode = async (button) => {
    const block = document.getElementById(button.dataset.copy);
    try {
      await navigator.clipboard.writeText(block.innerText);
      button.textContent = 'Copied';
    } catch {
      button.textContent = 'Press Ctrl+C';
    }
    setTimeout(() => {
      button.textContent = 'Copy';
    }, 2000);
  };

  /* ---------- live request log ---------- */
  let startedAt = 0;

  const setStep = (el, state) => {
    el.classList.remove('is-active', 'is-done');
    if (state) {
      el.classList.add(state);
    }
  };

  const formatBytes = (bytes) =>
    bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;

  document.body.addEventListener('htmx:beforeRequest', (event) => {
    if (event.detail.elt !== form) {
      return;
    }
    startedAt = performance.now();
    flowQ.textContent = `q=${input.value.trim()}`;
    reqPath.textContent = decodeURIComponent(
      event.detail.pathInfo.finalRequestPath
    );
    reqStatus.textContent = 'waiting for the server…';
    reqSize.textContent = 'response into #result';
    setStep(flowType, 'is-done');
    setStep(flowServer, 'is-active');
    setStep(flowSwap, '');
  });

  document.body.addEventListener('htmx:afterRequest', (event) => {
    if (event.detail.elt !== form) {
      return;
    }
    const { xhr, successful } = event.detail;
    const ms = Math.round(performance.now() - startedAt);

    if (!xhr || xhr.status === 0) {
      reqStatus.textContent = 'no response';
      setStep(flowServer, '');
      return;
    }

    const films = (xhr.responseText.match(/class="card"/g) || []).length;
    const bytes = new Blob([xhr.responseText]).size;
    reqStatus.textContent = `${xhr.status} ${successful ? 'OK' : 'Error'} · ${ms} ms`;
    reqSize.textContent = `${films === 1 ? '1 film' : `${films} films`} · ${formatBytes(bytes)} into #result`;
    setStep(flowServer, 'is-done');
    setStep(flowSwap, 'is-done');

    // Keep the address bar shareable without filling the history.
    const query = input.value.trim();
    history.replaceState(
      null,
      '',
      query ? `/?q=${encodeURIComponent(query)}` : '/'
    );
  });

  /* ---------- open a shared link ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    const shared = new URLSearchParams(window.location.search).get('q');
    if (shared) {
      input.value = shared;
      htmx.trigger(form, 'submit');
    }
  });

  /* ---------- "Code" link opens the code panel ---------- */
  const openCode = document.querySelector('[data-open-code]');
  if (openCode) {
    openCode.addEventListener('click', () => {
      const details = document.querySelector('.code-panel details');
      if (details) {
        details.open = true;
      }
    });
  }

  /* ---------- footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
