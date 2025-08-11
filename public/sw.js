self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
// (Opcional: luego te paso caché offline; esto es el mínimo para la “instalabilidad”.)
