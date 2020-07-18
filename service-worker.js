// This file is the service-worker.js, the service worker (in JavaScript) that can enable additional PWA features including
// caching, background sync and push notifications

// When the name of the cache changes, the cache will update, allowing any updated files to replace old files
var cacheName = 'realProjectTest1Cache1.79';

// Runs when the service worker is new and has just installed
self.addEventListener('install', event => {
    //Create cache of all files needed to use the app so that the user can use it offline
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll([
                // Caches index.html (since "/" will load index.html by default)
                '/',
                'app.js',
                'jquery-3.3.1.js',
                'manifest.json',
                // The following 2 files are for the google material icons
                'https://fonts.googleapis.com/icon?family=Material+Icons',
                'flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
                'app-pages/timeline.html',
                'app-pages/timeline-add-session.html',
                'app-pages/timeline-edit-session.html',
                'app-pages/goals.html',
                'app-pages/resources.html',
                'app-pages/about.html',
                'app-pages/edit-goal.html'
            ]);
        }).then(() => {
            console.log('Cache complete');
            // Installs the new service worker withiut having to wait for the previous service worker to go
            return self.skipWaiting();
        })
    );
});

// Runs when the service worker is successfully installed and previous version is deleted
self.addEventListener('activate', event => {
    // Delete data from old cache and anything else associated with the old service worker
    event.waitUntil(
        // Iterate through list of keys from the cache
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                // If the key doesn't match the cache name, delete the file
                if (key !== cacheName) {
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// Runs when the browser requests a resource. This method will determine whether each file is returned from the cache or the network.
// I have used the cache then network strategy (Google, n.d.), which returns a cached file if available or otherwise it sends the
// request on to the network
self.addEventListener('fetch', event => {
    console.log('Fetching ', event.request.url);
    event.respondWith(
        // Attempts to find the resource in the cache
        caches.match(event.request).then(response => {
            // Returns the response from the cache if avaiable, otherwise it will fetch the file from the network
            return response || fetch(event.request);
        })
    );
});