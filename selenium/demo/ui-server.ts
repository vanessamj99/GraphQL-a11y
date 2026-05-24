import http from "http";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const movies = JSON.parse(
  readFileSync(path.join(REPO_ROOT, "demo", "movies.fixture.json"), "utf8"),
) as Array<{
  id: string;
  title: string;
  releaseYear: number;
  rating: number;
}>;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function movieSentence(movie: {
  title: string;
  rating: number;
  releaseYear: number;
}): string {
  return `${movie.title}, rated ${movie.rating} out of 10, released in ${movie.releaseYear}.`;
}

const server = http.createServer((req, res) => {
  if (req.url !== "/movies") {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Not found");
    return;
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Movies</title>
    <style>
      .movie-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .movie-row {
        display: list-item;
        margin: 0 0 0.5rem;
        font-size: 2rem;
      }
    </style>
  </head>
  <body>
    <main>
      <ul class="movie-list" aria-label="Movie list">
      ${movies
        .map((movie) => {
          const summary = escapeHtml(movieSentence(movie));
          return `
      <li class="movie-row">${summary}</li>`;
        })
        .join("\n")}
      </ul>
    </main>
  </body>
</html>`;

  res.end(html);
});

server.listen(4004, () => {
  console.log("UI demo running at http://127.0.0.1:4004/movies");
});
