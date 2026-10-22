'use strict';

// Builds a static copy of the public website (no server, no Back Office) for GitHub Pages.
//   BASE_PATH=/minikitchen node scripts/build-static.js [outDir]
//
// Pages are rendered from views/ exactly as the server does, marked data-api="off" so the
// storefront skips API calls and runs on the bundled menu and content.
const fs = require('fs');
const path = require('path');
const config = require('../src/config');
const { renderPage, STOREFRONT_PAGES } = require('../src/pages');

const OUT = path.resolve(process.argv[2] || path.join(config.ROOT, 'dist'));
const BASE = String(process.env.BASE_PATH || '').replace(/\/+$/, '');

const ADMIN_NOTICE = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Back Office unavailable | Mini Kitchen</title>
    <link rel="stylesheet" href="css/storefront/tokens.css" />
    <link rel="stylesheet" href="css/storefront/base.css" />
    <link rel="stylesheet" href="css/storefront/components.css" />
  </head>
  <body style="min-height: 100vh; display: grid; place-items: center; padding: 24px; text-align: center">
    <main style="max-width: 520px">
      <h1>Back Office</h1>
      <p>This is the static preview of the Mini Kitchen website. The Back Office needs the Mini Kitchen server and is
        not available here.</p>
      <p><a class="btn btn-primary" href="index.html">Back to the website</a></p>
    </main>
  </body>
</html>
`;

function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.cpSync(config.PUBLIC_DIR, OUT, { recursive: true });

  for (const name of Object.keys(STOREFRONT_PAGES)) {
    const { html } = renderPage(name);
    fs.writeFileSync(path.join(OUT, name), html.replace(/<html\b/, '<html data-api="off"'));
  }
  fs.writeFileSync(path.join(OUT, 'admin.html'), ADMIN_NOTICE);

  // 404.html can be served at any depth, so it uses root-absolute links; prefix them with the base path.
  const notFound = path.join(OUT, '404.html');
  fs.writeFileSync(notFound, fs.readFileSync(notFound, 'utf8').replace(/(href|src)="\//g, `$1="${BASE}/`));

  // Serve files as-is (no Jekyll processing on GitHub Pages).
  fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

  console.log(
    `[build-static] Wrote ${Object.keys(STOREFRONT_PAGES).length + 1} pages to ${OUT} (base "${BASE || '/'}")`
  );
}

build();
