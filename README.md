# Rapid HTMX Search

A showcase of **HTMX** in action — fast, reactive, server‑driven UI updates without the overhead of a client‑side framework. This project is built with **Express.js** (Node.js server), plain **HTML** for the frontend and **Tailwind CSS** (utility-first CSS).

---

## How it Works

- **Express.js** serves the HTML frontend and handles movie search requests via a `/search` endpoint.
- **HTMX** enables dynamic, partial page updates by swapping HTML fragments from the server into the page, with minimal JavaScript.
- **Tailwind CSS** is used for all styling, configured via `public/tailwind.config.js`.
- The UI is pure HTML (see `public/movie-finder.html`), with a small script for theme toggling and UI polish.

---

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/rolandjlevy/express-htmx-movie-finder.git
cd express-rapid-htmx-search
npm install
```

### 2. Configure Environment

1. Copy the example environment file:
   ```bash
   cp .env-example .env
   ```
2. Add your OMDB API key to the `.env` file:
   ```env
   OMDB_API_KEY=your_omdb_api_key_here
   PORT=3000 # or any port you prefer
   ```

### 3. Run the Express Server

```bash
npm start
# or
node index.js
```

The server will start (default: http://localhost:3000). Open this URL in your browser to use the app.

---

## Project Structure

- `index.js` — Express.js server, handles static files and `/search` endpoint
- `public/movie-finder.html` — Main HTML UI
- `public/styles.css` — Tailwind CSS (imported in HTML)
- `public/tailwind.config.js` — Tailwind config (colors, dark mode, etc.)
- `public/script.js` — UI logic (theme toggle, random, clear, etc.)
- `.env` — Your OMDB API key and port

---

## Live Demo

- [Movie Finder Demo](https://express-htmx-movie-finder.vercel.app/)

---

## Development Notes

- **Tailwind CSS** is loaded via CDN for quick prototyping.
- **HTMX** is loaded via CDN in the HTML.
- **Lucide Icons** are used for UI icons (also via CDN).

---

## Useful Links

- [HTMX documentation](https://htmx.org/docs)
- [HTMX examples](https://htmx.org/examples)
- [HTMX server examples](https://htmx.org/server-examples)
- [Awesome HTMX](https://github.com/rajasegar/awesome-htmx)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express.js](https://expressjs.com/)
- [Using Express in Vercel](https://vercel.com/guides/using-express-with-vercel)

---

## VS Code Simple Browser

To preview the app in VS Code:

1. Start the server (`npm start`)
2. Get the local URL (see terminal output, e.g., http://localhost:3000)
3. Open the Command Palette → `Simple Browser: Show`
4. Paste in the URL
