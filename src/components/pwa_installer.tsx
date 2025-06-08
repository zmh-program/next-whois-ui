"use client";

import "@khmyznikov/pwa-install";
import { useEffect } from "react";
export default function PWAInstaller({ ...props }) {
  return (
    // @ts-ignore
    <pwa-install id={`pwa-install`} {...props}></pwa-install>
  );
}

export type PWAInstallerMethods = {
  install: (force?: boolean) => void;
  isListening?: boolean;
  showDialog: (force?: boolean) => void;
  addEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) => void;
};

export function usePWAInstaller() {
  const getInstallerElement = (): PWAInstallerMethods =>
    document.getElementById("pwa-install") as unknown as PWAInstallerMethods;

  return {
    install: (force?: boolean) => {
      const installer = getInstallerElement();
      installer?.showDialog(force);

      console.log(
        `[installer] ${force ? "forced" : "prompted"} installation to:`,
        installer,
      );

      if (installer && !installer.isListening) {
        // register events
        installer.isListening = true;

        installer.addEventListener("pwa-install-success-event", (e) => {
          console.log("[installer] installation success:", e);
        });

        installer.addEventListener("pwa-install-fail-event", (e) => {
          console.error("[installer] installation failed:", e);
        });

        installer.addEventListener("pwa-install-available-event", (e) => {
          console.log("[installer] installation available:", e);
        });

        installer.addEventListener("pwa-user-choice-result-event", (e) => {
          console.log("[installer] user choice result:", e);
        });

        installer.addEventListener("pwa-install-how-to-event", (e) => {
          console.log("[installer] installation how to:", e);
        });

        installer.addEventListener("pwa-install-gallery-event", (e) => {
          console.log("[installer] installation gallery:", e);
        });
      }
    },
  };
}
