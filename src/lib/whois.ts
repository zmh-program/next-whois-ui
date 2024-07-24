export type WhoisResult = {
  status: boolean;
  result?: WhoisAnalyzeResult;
  error?: string;
};

export function lookupWhois(domain: string): Promise<WhoisResult> {
  const whois = require("whois");

  return new Promise((resolve, reject) => {
    try {
      whois.lookup(domain, (err: Error, data: string) => {
        if (err) {
          resolve({
            status: false,
            error: err.message,
          });
        } else {
          if (
            data.toLowerCase().includes("no match for domain") ||
            data.toLowerCase().includes("this query returned 0 objects")
          ) {
            resolve({
              status: false,
              error: `No match for domain ${domain} (e.g. domain is not registered)`,
            });
          }

          resolve({
            status: true,
            result: analyzeWhois(data),
          });
        }
      });
    } catch (e) {
      const message = (e as Error).message;
      resolve({
        status: false,
        error: message,
      });
    }
  });
}

export type WhoisAnalyzeResult = {
  domain: string;
  registrar: string;
  registrarURL: string;
  ianaId: string;
  whoisServer: string;
  updatedDate: string;
  creationDate: string;
  expirationDate: string;
  status: DomainStatusProps[];
  registrantOrganization: string;
  registrantProvince: string;
  registrantCountry: string;
  registrantPhone: string;
  registrantEmail: string;
  rawWhoisContent: string;
};

type DomainStatusProps = {
  status: string;
  url: string;
};

const initialWhoisAnalyzeResult: WhoisAnalyzeResult = {
  domain: "",
  registrar: "",
  registrarURL: "",
  ianaId: "",
  whoisServer: "",
  updatedDate: "",
  creationDate: "",
  expirationDate: "",
  status: [],
  registrantOrganization: "",
  registrantProvince: "",
  registrantCountry: "",
  registrantPhone: "",
  registrantEmail: "",
  rawWhoisContent: "",
};

function analyzeDomainStatus(status: string): DomainStatusProps {
  const segments = status.split(" ");
  let url = segments.slice(1).join(" ");

  url.startsWith("(") && url.endsWith(")") && (url = url.slice(1, -1));
  return {
    status: segments[0],
    url,
  };
}

function analyzeTime(time: string): string {
  if (!time || time.length === 0) return time;

  try {
    const date = new Date(time);
    return date.toISOString();
  } catch (e) {
    return time;
  }
}

export function analyzeWhois(data: string): WhoisAnalyzeResult {
  const lines = data
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const result: WhoisAnalyzeResult = { ...initialWhoisAnalyzeResult };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const segments = line.split(":");
    if (segments.length < 2) continue;

    const key = segments[0].trim().toLowerCase();
    const value = segments.slice(1).join(":").trim();

    switch (key) {
      case "domain name":
        result.domain = value;
        break;
      case "registrar":
        result.registrar = value;
        break;
      case "registrar url":
        result.registrarURL = value;
        break;
      case "iana id":
        result.ianaId = value;
        break;
      case "registrar iana id":
        result.ianaId = value;
        break;
      case "whois server":
        result.whoisServer = value;
        break;
      case "registrar whois server":
        result.whoisServer = value;
        break;
      case "updated date":
        result.updatedDate = analyzeTime(value);
        break;
      case "creation date":
        result.creationDate = analyzeTime(value);
        break;
      case "expiration date":
        result.expirationDate = analyzeTime(value);
        break;
      case "registrar registration expiration date":
        result.expirationDate = analyzeTime(value);
        break;
      case "status":
        result.status.push(analyzeDomainStatus(value));
        break;
      case "domain status":
        result.status.push(analyzeDomainStatus(value));
        break;
      case "registrant name":
        result.registrantOrganization = value;
        break;
      case "registrant organization":
        result.registrantOrganization = value;
        break;
      case "registrant state/province":
        result.registrantProvince = value;
        break;
      case "registrant country":
        result.registrantCountry = value;
        break;
      case "registrant phone":
        result.registrantPhone = value.replace("tel:", "").replace(".", " ");
        break;
      case "registrar abuse contact phone":
        result.registrantPhone = value.replace("tel:", "").replace(".", " ");
        break;
      case "registrant email":
        result.registrantEmail = value;
        break;
    }
  }

  result.rawWhoisContent = data;
  return result;
}
