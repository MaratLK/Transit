import fs, { existsSync } from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import express from 'express';
import * as HelmetPkg from 'helmet';
import crypto from 'crypto';
import { APP_BASE_HREF } from '@angular/common';
import { CSP_NONCE } from '@angular/core';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const helmet = (HelmetPkg as any).default || HelmetPkg;
const browserDistFolder = resolve(__dirname, '../browser');
const indexHtml = existsSync(join(browserDistFolder, 'index.server.html'))
  ? join(browserDistFolder, 'index.server.html')
  : join(browserDistFolder, 'index.html');

const app = express();
const commonEngine = new CommonEngine();

app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals['nonce'] = nonce;

  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://cdnjs.cloudflare.com https://fonts.googleapis.com`,
    `style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://fonts.googleapis.com`,
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self' https://localhost:4200 http://localhost:5169",
    "frame-ancestors 'none'",
    "base-uri 'self'"
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspDirectives);
  next();
});

app.use(helmet());

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
  }),
);

app.get('*', (req, res, next) => {
  const { protocol, headers, originalUrl, baseUrl } = req;
  const nonceValue = res.locals['nonce'];
  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [
        { provide: APP_BASE_HREF, useValue: baseUrl },
        { provide: CSP_NONCE,    useValue: nonceValue }
      ]
    })
    .then(html => res.send(html))
    .catch(err => next(err));
});

if (isMainModule(import.meta.url)) {
  const SSL_KEY_PATH  = path.join(__dirname, 'ssl', 'localhost.key');
  const SSL_CERT_PATH = path.join(__dirname, 'ssl', 'localhost.crt');

  const sslOptions = {
    key:  fs.readFileSync(SSL_KEY_PATH),
    cert: fs.readFileSync(SSL_CERT_PATH)
  };

  const port = parseInt(process.env['PORT'] || '4000', 10);
  https.createServer(sslOptions, app).listen(port, () => {
    console.log(`Node Express SSR (HTTPS) listening on https://localhost:${port}`);
  });
}
