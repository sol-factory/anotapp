"use client";

import { useEffect } from "react";

export function KeepScreenAwake() {
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;

    let wakeLock: WakeLockSentinel | null = null;
    let requestInProgress = false;
    let disposed = false;

    const requestWakeLock = async () => {
      if (
        disposed ||
        document.visibilityState !== "visible" ||
        (wakeLock && !wakeLock.released) ||
        requestInProgress
      ) {
        return;
      }

      requestInProgress = true;

      try {
        const lock = await navigator.wakeLock.request("screen");

        if (disposed) {
          await lock.release();
          return;
        }

        wakeLock = lock;
        lock.addEventListener("release", () => {
          if (wakeLock === lock) wakeLock = null;
        });
      } catch {
        // Algunos navegadores requieren que el pedido ocurra tras una interacción.
        // Los listeners de abajo vuelven a intentarlo en el próximo toque o tecla.
      } finally {
        requestInProgress = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void requestWakeLock();
    };

    void requestWakeLock();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("pointerdown", requestWakeLock);
    document.addEventListener("keydown", requestWakeLock);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("pointerdown", requestWakeLock);
      document.removeEventListener("keydown", requestWakeLock);
      void wakeLock?.release();
    };
  }, []);

  return null;
}
