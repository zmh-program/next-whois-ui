"use client";

import "@khmyznikov/pwa-install";
export default function PWAInstaller({ ...props }) {
  return (
    // @ts-ignore
    <pwa-install {...props}></pwa-install>
  );
}

export type PWAInstallerMethods = {
  install: (force?: boolean) => void;
};

export function usePWAInstaller() {
  const getInstallerElement = (): PWAInstallerMethods =>
    document.getElementsByTagName(
      "pwa-install",
    )[0] as unknown as PWAInstallerMethods;

  return {
    install: (force?: boolean) => {
      const installer = getInstallerElement();
      installer?.install(force);
    },
  };
}
