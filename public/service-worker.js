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
    }

    const title = data.title || "New Notification";
    const options = {
        body: data.body || "You have a new update!",
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        vibrate: [200, 100, 200], // Vibrate pattern for mobile
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

    if (event.action === "open") {
        event.waitUntil(clients.openWindow(event.notification.data.url));
    } else {
        event.waitUntil(
            clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
                if (clientList.length > 0) {
                    return clientList[0].focus();
                }
                return clients.openWindow(event.notification.data.url);
            })
        );
    }
});
