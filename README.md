# Rapid HTMX Search

A showcase of **HTMX** in action — fast, reactive, server‑driven UI updates without the overhead of a client‑side framework. This project is built with **Express.js** (Node.js server), plain **HTML** and hand-written **CSS** (no build step).

---

## How it Works

- **Express.js** serves the HTML frontend and handles movie search requests via a `/search` endpoint.
- **HTMX** enables dynamic, partial page updates by swapping HTML fragments from the server into the page, with minimal JavaScript.
- Styling is plain CSS with design tokens and a light/dark theme (`public/styles.css`).
- Results are shareable: the search is kept in the URL as `?q=`.
- The UI is pure HTML (see `public/movie-finder.html`), with a small script for theme toggling and UI polish.

---

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/rolandjlevy/express-htmx-movie-finder.git
cd express-htmx-movie-finder
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
npm start        # node index.js
npm run dev      # same, with nodemon auto-restart
```

The server will start (default: http://localhost:3000). Open this URL in your browser to use the app.

---

## Project Structure

- `index.js` — Express.js server, handles static files and `/search` endpoint
- `public/movie-finder.html` — Main HTML UI
- `public/styles.css` — all styling (tokens, light/dark themes)
- `public/vendor/htmx.min.js` — HTMX 1.9.12, self-hosted
- `public/script.js` — UI logic (theme toggle, random, clear, etc.)
- `.env` — Your OMDB API key and port

---

## Live Demo

- [Movie Finder Demo](https://express-htmx-movie-finder.vercel.app/)

---

## Development Notes

- **HTMX** is self-hosted in `public/vendor`; icons are inline SVG. The only external request is Google Fonts.
- Each search makes up to 11 OMDb calls (one list plus up to 10 detail lookups), cached for 10 minutes, so mind your API quota.

---

## Useful Links

- [HTMX documentation](https://htmx.org/docs)
- [HTMX examples](https://htmx.org/examples)
- [HTMX server examples](https://htmx.org/server-examples)
- [Awesome HTMX](https://github.com/rajasegar/awesome-htmx)
- [Express.js](https://expressjs.com/)
- [Using Express in Vercel](https://vercel.com/guides/using-express-with-vercel)

---

## VS Code Simple Browser

To preview the app in VS Code:

1. Start the server (`npm start`)
2. Get the local URL (see terminal output, e.g., http://localhost:3000)
3. Open the Command Palette → `Simple Browser: Show`
4. Paste in the URL
