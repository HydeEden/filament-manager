/* Filament Manager — Hyde Eden 3D: service worker.
 *
 * Caches the app shell (the page, the brand catalogs, the logo, the
 * icons, and this manifest) so the installed app opens offline on
 * Windows, Mac, Android, and iOS. Inventory data itself lives in the
 * cloud (Supabase), one private copy per signed-in account, and is
 * never cached here — the app keeps its own last-known copy per
 * account in the browser for offline opening and syncs when the
 * connection is back. Supabase requests always go to the network.
 */
var CACHE_NAME = "filament-manager-shell-v4";
var SHELL_URLS = [
  "./",
  "index.html",
  "assets/catalogs.js",
  "assets/hyde-eden-3d-logo.png",
  "assets/manifest.webmanifest",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/icon-maskable-512.png",
  "assets/apple-touch-icon.png",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(SHELL_URLS);
      })
      .then(function () {
        return self.skipWaiting();
      })
      .catch(function () {
        /* A shell file failed to cache (e.g. first install while
         * offline) — the worker still activates; the app itself
         * also keeps a last-known data copy for offline use. */
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys.map(function (key) {
            return key === CACHE_NAME ? null : caches.delete(key);
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function (event) {
  var url;
  try {
    url = new URL(event.request.url);
  } catch (e) {
    return;
  }
  /* Cloud data is never served from (or stored in) the shell cache. */
  if (url.hostname.indexOf("supabase.co") !== -1) return;
  if (event.request.method !== "GET") return;

  /* Navigations: network first so a fresh build lands as soon as it
   * is published, with the cached shell as the offline fallback. */
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(function (res) {
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put("./", copy);
          });
          return res;
        })
        .catch(function () {
          return caches.match("./").then(function (hit) {
            return hit || caches.match("index.html");
          });
        })
    );
    return;
  }

  /* Shell files: cache first, then network (and cache what the
   * network returns, so a file added later still ends up cached). */
  event.respondWith(
    caches.match(event.request).then(function (hit) {
      if (hit) return hit;
      return fetch(event.request).then(function (res) {
        if (res && res.ok && url.origin === self.location.origin) {
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, copy);
          });
        }
        return res;
      });
    })
  );
});
