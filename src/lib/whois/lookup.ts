import { MAX_WHOIS_FOLLOW } from "@/lib/env";
import whois from "whois-raw";
import { WhoisResult } from "@/lib/whois/types";
import { parseWhoisData } from "@/lib/whois/tld_parser";

export function lookupWhois(domain: string): Promise<WhoisResult> {
  const startTime = Date.now();

  const options = {
    follow: MAX_WHOIS_FOLLOW,
  };

  return new Promise((resolve) => {
    try {
      whois.lookup(domain, options, (err: Error, data: string) => {
        if (err) {
          throw err;
        }

        resolve({
          status: true,
          time: (Date.now() - startTime) / 1000,
          result: parseWhoisData(data, domain),
        });
      });
    } catch (e) {
      const message = (e as Error).message;

      resolve({
        status: false,
        time: (Date.now() - startTime) / 1000,
        error: message,
      });
    }
  });
}
