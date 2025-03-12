self.addEventListener("install", (event) => {
    console.log("Service Worker installed");
    event.waitUntil(
        caches.open("pwa-cache").then((cache) => {
            return cache.addAll(["/", "/index.html", "/icon-192x192.png"]);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener("push", function (event) {
    console.log("Push event received:", event);

    let data = {};
    if (event.data) {
        data = event.data.json(); // Parse push event payload
        console.log("Push Data:", data);
    }

    const title = data.title || "New Notification";
    const options = {
        body: data.body || "You have a new update!",
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        vibrate: [200, 100, 200], // Vibrate pattern for mobile
        tag: "pwa-notification", // Ensures notifications don't stack
        renotify: true, // New notifications will replace old ones with the same tag
        data: { url: data.url || "/" }, // Store a link to open
        actions: [
            { action: "open", title: "Open App" },
            { action: "dismiss", title: "Dismiss" }
        ]
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// Handle click on the notification
self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    console.log("Notification clicked, action:", event.action);

    if (event.action === "dismiss") {
        return; // Do nothing, user dismissed the notification
    }

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            for (let client of clientList) {
                if (client.url === event.notification.data.url && "focus" in client) {
                    return client.focus();
                }
            }
            // If app is not open, open it in a new tab
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});

// Handle service worker activation
self.addEventListener("activate", (event) => {
    console.log("Service Worker activated");
    event.waitUntil(self.clients.claim());
});
