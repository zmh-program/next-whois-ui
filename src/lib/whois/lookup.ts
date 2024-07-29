import { MAX_IP_WHOIS_FOLLOW, MAX_WHOIS_FOLLOW } from "@/lib/env";
import whois from "whois-raw";
import { WhoisResult } from "@/lib/whois/types";
import { parseWhoisData } from "@/lib/whois/tld_parser";
import { countDuration, toErrorMessage } from "@/lib/utils";
import { getDomain } from "tldjs";

export function getLookupOptions(domain: string) {
  const isDomain = !!getDomain(domain);
  return {
    follow: isDomain ? MAX_WHOIS_FOLLOW : MAX_IP_WHOIS_FOLLOW,
  };
}

export function getLookupRawWhois(
  domain: string,
  options?: any,
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      whois.lookup(domain, options, (err: Error, data: string) => {
        if (err) {
          // reject err like tld error
          reject(err);
        } else {
          resolve(data);
        }
      });
    } catch (e) {
      // reject err like connection error
      reject(e);
    }
  });
}
export async function lookupWhois(domain: string): Promise<WhoisResult> {
  const startTime = Date.now();

  try {
    const data = await getLookupRawWhois(domain, getLookupOptions(domain));
    const endTime = Date.now();
    const parsed = parseWhoisData(data, domain);

    return {
      status: true,
      time: countDuration(startTime, endTime),
      result: parsed,
    };
  } catch (e) {
    return {
      status: false,
      time: countDuration(startTime),
      error: toErrorMessage(e),
    };
  }
}
