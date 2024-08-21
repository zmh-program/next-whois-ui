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
  const rawContent = rawData.toLowerCase();
  if (
    rawContent.match(filterRegex.notFound) ||
    rawContent.includes("no match") ||
    rawContent.includes("this query returned 0 objects") ||
    rawContent.includes("not found") ||
    rawContent.includes("no entries found") ||
    rawContent.includes("no data found")
  ) {
    throw new Error("Domain or TLD not found");
  }

  if (
    rawContent.includes("invalid query") ||
    rawContent.includes("invalid request") ||
    rawContent.includes("invalid domain name") ||
    rawContent.includes("invalid input") ||
    rawContent.includes("invalid object") ||
    rawContent.includes("invalid syntax") ||
    rawContent.includes("invalid character") ||
    rawContent.includes("invalid data") ||
    rawContent.includes("malformed query") ||
    rawContent.includes("malformed request")
  ) {
    throw new Error("Invalid format");
  }

  // rateLimited Match
  if (
    filterRegex.rateLimited &&
    (rawData.match(filterRegex.rateLimited) ||
      rawContent.includes("rate limit") ||
      rawContent.includes("server too busy"))
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
      url = url ?? "";
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
      const expirationDate = moment(match[1], filterRegex.dateFormat).toJSON();
      expirationDate && (result.expirationDate = expirationDate);
    }
  }

  // creationDate Match
  if (filterRegex.creationDate) {
    const regex = new RegExp(filterRegex.creationDate);
    const match = rawData.match(regex);
    if (match) {
      const creationDate = moment(match[1], filterRegex.dateFormat).toJSON();
      creationDate && (result.creationDate = creationDate);
    }
  }

  // updatedDate Match
  if (filterRegex.updatedDate) {
    const regex = new RegExp(filterRegex.updatedDate);
    const match = rawData.match(regex);
    if (match) {
      const updatedDate = moment(match[1], filterRegex.dateFormat).toJSON();
      updatedDate && (result.updatedDate = updatedDate);
    }
  }

  return result;
}
