declare module "whois-raw" {
  export function lookup(
    domain: string,
    options: any,
    callback: (err: Error, data: string) => void,
  ): void;
}

declare module "@khmyznikov/pwa-install" {
  export default class PWAInstall extends HTMLElement {
    constructor();
  }
}
