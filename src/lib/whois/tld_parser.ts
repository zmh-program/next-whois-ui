import moment from "moment";

import { getDomainRegex } from "@/lib/whois/lib";
import { DomainStatusProps, WhoisAnalyzeResult } from "@/lib/whois/types";
import { analyzeWhois } from "@/lib/whois/common_parser";

export function parseWhoisData(rawData: string, domain: string) {
  // preflight check
  if (!rawData) {
    throw new Error("No Whois data received");
  } else if (rawData.length <= 10) {
    throw new Error(`Bad Whois data received: ${rawData}`);
  }

  const filterRegex = getDomainRegex(domain.toLowerCase());

  // notFound Match
  if (
    rawData.match(filterRegex.notFound) ||
    rawData.includes("no match for domain") ||
    rawData.includes("this query returned 0 objects") ||
    rawData.includes("not found") ||
    rawData.includes("no entries found") ||
    rawData.includes("malformed query") ||
    rawData.includes("malformed request")
  ) {
    throw new Error("Domain not found");
  }

  // rateLimited Match
  if (
    filterRegex.rateLimited &&
    (rawData.match(filterRegex.rateLimited) ||
      rawData.toLowerCase().includes("rate limit") ||
      rawData.toLowerCase().includes("server too busy"))
  ) {
    throw new Error("Rate Limited");
  }

  // pre set result
  const result: WhoisAnalyzeResult = analyzeWhois(rawData);

  // domainName Match
  if (filterRegex.domainName) {
    const regex = new RegExp(filterRegex.domainName);
    const match = rawData.match(regex);
    if (match) {
      result.domain = match[1].toUpperCase();
    }
  }

  // registrar Match
  if (filterRegex.registrar) {
    const regex = new RegExp(filterRegex.registrar);
    const match = rawData.match(regex);
    if (match) {
      result.registrar = match[1];
    }
  }

  // status Match
  if (filterRegex.status) {
    // using while and exec
    const statusRegex = new RegExp(filterRegex.status, "g");
    let match;

    let newStatus: DomainStatusProps[] = [];
    while ((match = statusRegex.exec(rawData)) !== null) {
      let [status, url] = match[1].split(" ");
      url = url.startsWith("(") && url.endsWith(")") ? url.slice(1, -1) : url;
      newStatus.push({ status, url });
    }

    newStatus.length && (result.status = newStatus);
  }

  // nameServers Match
  if (filterRegex.nameServers) {
    const regex = new RegExp(filterRegex.nameServers, "g");

    let match;
    let newNS: string[] = [];

    while ((match = regex.exec(rawData)) !== null) {
      newNS.push(match[1]);
    }

    newNS.length && (result.nameServers = newNS);
  }

  // expirationDate Match
  if (filterRegex.expirationDate) {
    const regex = new RegExp(filterRegex.expirationDate);
    const match = rawData.match(regex);
    if (match) {
      result.expirationDate = moment(match[1], filterRegex.dateFormat).toJSON();
    }
  }

  // creationDate Match
  if (filterRegex.creationDate) {
    const regex = new RegExp(filterRegex.creationDate);
    const match = rawData.match(regex);
    if (match) {
      result.creationDate = moment(match[1], filterRegex.dateFormat).toJSON();
    }
  }

  // updatedDate Match
  if (filterRegex.updatedDate) {
    const regex = new RegExp(filterRegex.updatedDate);
    const match = rawData.match(regex);
    if (match) {
      result.updatedDate = moment(match[1], filterRegex.dateFormat).toJSON();
    }
  }

  return result;
}
