
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/Transit/',
  locale: undefined,
  routes: undefined,
  entryPointToBrowserMapping: {
  "src/app/components/auth/auth.component.ts": [
    {
      "path": "chunk-HP7VTEVR.js",
      "dynamicImport": false
    }
  ]
},
  assets: {
    'index.csr.html': {size: 5868, hash: '86e31c6734823dc58fcb66af4513b6267db0cb173ab521a38d879e64b03ef664', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 4554, hash: 'f33a452a5b059c57cab25ed896f921c44dcfe0b82d15c1aa454f289997fbd1a4', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-P5YM4ZRP.css': {size: 24603, hash: 'mWqMI8+jn3s', text: () => import('./assets-chunks/styles-P5YM4ZRP_css.mjs').then(m => m.default)}
  },
};
