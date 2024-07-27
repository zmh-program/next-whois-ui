// thanks to https://github.com/benfiratkaya/whois-parsed-v2/blob/main/parse-raw-data.js

var moment = require("moment");

var defaultRegex = {
  domainName: "Domain Name: *([^\\s]+)",
  registrar: "Registrar: *(.+)",
  updatedDate: "Updated Date: *(.+)",
  creationDate: "Creat(ed|ion) Date: *(.+)",
  expirationDate: "Expir\\w+ Date: *(.+)",
  status: "Status:\\s*(.+)\\s*\\n",
  nameServers: "Name Server: *(.+)",
  dateFormat: "YYYY-MM-DDThh:mm:ssZ",
  notFound: "(No match for |Domain not found|NOT FOUND\\s)",
};

var comRegex = {
  domainName: "Domain Name: *([^\\s]+)",
  registrar: "Registrar: *(.+)",
  updatedDate: "Updated Date: *(.+)",
  creationDate: "Creation Date: *(.+)",
  expirationDate: "Expir\\w+ Date: *(.+)",
  status: "Status:\\s*(.+)\\s*\\n",
  nameServers: "Name Server: *(.+)",
  notFound: "No match for ",
};

var orgRegex = {
  domainName: "Domain Name: *([^\\s]+)",
  registrar: "Registrar: *(.+)",
  updatedDate: "Updated Date: *(.+)",
  creationDate: "Creation Date: *(.+)",
  expirationDate: "Expir\\w+ Date: *(.+)",
  status: "Status: *(.+)",
  nameServers: "Name Server: *(.+)",
  notFound: "^NOT FOUND",
};

var auRegex = {
  domainName: "Domain Name: *([^\\s]+)",
  updatedDate: "Last Modified: *(.+)",
  registrar: "Registrar Name: *(.+)",
  status: "Status: *(.+)",
  nameServers: "Name Server: *(.+)",
  rateLimited: "WHOIS LIMIT EXCEEDED",
  notFound: "^NOT FOUND",
};

var usRegex = {
  domainName: "Domain Name: *([^\\s]+)",
  registrar: "Registrar: *(.+)",
  status: "Domain Status: *(.+)",
  creationDate: "Creation Date: *(.+)",
  expirationDate: "Registry Expiry Date: *(.+)",
  updatedDate: "Updated Date: *(.+)",
  nameServers: "Name Server: *(.+)",
  notFound: "^No Data Found",
  dateFormat: "YYYY-MM-DDThh:mm:ssZ",
};

var ruRegex = {
  // and .рф .su
  domainName: "domain: *([^\\s]+)",
  registrar: "registrar: *(.+)",
  creationDate: "created: *(.+)",
  expirationDate: "paid-till: *(.+)",
  status: "state: *(.+)",
  notFound: "No entries found",
};

var ukRegex = {
  domainName: "Domain name:\\s*([^\\s]+)",
  registrar: "Registrar:\\s*(.+)",
  status: "Registration status:\\s*(.+)",
  creationDate: "Registered on:\\s*(.+)",
  expirationDate: "Expiry date:\\s*(.+)",
  updatedDate: "Last updated:\\s*(.+)",
  notFound: "No match for ",
  dateFormat: "DD-MMM-YYYY",
};

var frRegex = {
  domainName: "domain: *([^\\s]+)",
  registrar: "registrar: *(.+)",
  creationDate: "created: *(.+)",
  expirationDate: "Expir\\w+ Date:\\s?(.+)",
  status: "status: *(.+)",
  updatedDate: "last-update: *(.+)",
  notFound: "No entries found in ",
  dateFormat: "YYYY-MM-DDThh:mm:ssZ",
};

var nlRegex = {
  domainName: "Domain Name: *([^\\s]+)",
  registrar: "Registrar: *\\s*(.+)",
  status: "Status: *(.+)",
  notFound: "\\.nl is free",
  rateLimited: "maximum number of requests per second exceeded",
};

var fiRegex = {
  domainName: "domain\\.*: *([\\S]+)",
  registrar: "registrar\\.*: *(.*)",
  status: "status\\.*: *([\\S]+)",
  creationDate: "created\\.*: *([\\S]+)",
  updatedDate: "modified\\.*: *([\\S]+)",
  expirationDate: "expires\\.*: *([\\S]+)",
  notFound: "Domain not found",
  dateFormat: "DD.MM.YYYY hh:mm:ss",
};

var jpRegex = {
  domainName: "\\[Domain Name\\]\\s*([^\\s]+)",
  creationDate: "\\[Created on\\]\\s*(.+)",
  updatedDate: "\\[Last Updated\\]\\s?(.+)",
  expirationDate: "\\[Expires on\\]\\s?(.+)",
  status: "\\[Status\\]\\s*(.+)",
  notFound: "No match!!",
  dateFormat: "YYYY/MM/DD",
};

var plRegex = {
  domainName: "DOMAIN NAME: *([^\\s]+)[s]+$",
  registrar: "REGISTRAR: *\\s*(.+)",
  status: "Registration status:\\n\\s*(.+)",
  creationDate: "created: *(.+)",
  expirationDate: "renewal date: *(.+)",
  updatedDate: "last modified: *(.+)",
  notFound: "No information available about domain name",
  dateFormat: "YYYY.MM.DD hh:mm:ss",
};

var brRegex = {
  domainName: "domain: *([^\\s]+)\n",
  status: "status: *(.+)",
  creationDate: "created: *(.+)",
  expirationDate: "expires: *(.+)",
  updatedDate: "changed: *(.+)",
  dateFormat: "YYYYMMDD",
  notFound: "No match for ",
};

var euRegex = {
  domainName: "Domain: *([^\\n\\r]+)",
  registrar: "Registrar: *\\n *Name: *([^\\n\\r]+)",
  notFound: "Status: AVAILABLE",
};

var eeRegex = {
  domainName: "Domain: *[\\n\\r]+s*name: *([^\\n\\r]+)",
  status: "Domain: *[\\n\\r]+\\s*name: *[^\\n\\r]+\\sstatus: *([^\\n\\r]+)",
  creationDate:
    "Domain: *[\\n\\r]+\\s*name: *[^\\n\\r]+\\sstatus: *[^\\n\\r]+\\sregistered: *([^\\n\\r]+)",
  updatedDate:
    "Domain: *[\\n\\r]+\\s*name: *[^\\n\\r]+\\sstatus: *[^\\n\\r]+\\sregistered: *[^\\n\\r]+\\schanged: *([^\\n\\r]+)",
  expirationDate:
    "Domain: *[\\n\\r]+\\s*name: *[^\\n\\r]+\\sstatus: *[^\\n\\r]+\\sregistered: *[^\\n\\r]+\\schanged: *[^\\n\\r]+\\sexpire: *([^\\n\\r]+)",
  registrar: "Registrar: *[\\n\\r]+\\s*name: *([^\\n\\r]+)",
  notFound: "Domain not found",
  dateFormat: "YYYY-MM-DD",
};

var krRegex = {
  domainName: "Domain Name\\s*: *([^\\s]+)",
  creationDate: "Registered Date\\s*: *(.+)",
  updatedDate: "Last Updated Date\\s*: *(.+)",
  expirationDate: "Expiration Date\\s*: *(.+)",
  registrar: "Authorized Agency\\s*: *(.+)",
  dateFormat: "YYYY. MM. DD.",
  notFound: "The requested domain was not found ",
};

var bgRegex = {
  domainName: "DOMAIN NAME: *([^\\s]+)",
  status: "registration status:\\s*(.+)",
  notFound: "registration status: available",
  rateLimited: "Query limit exceeded",
};

var deRegex = {
  domainName: "Domain: *([^\\s]+)",
  status: "Status: *(.+)",
  updatedDate: "Changed: *(.+)",
  notFound: "Status: *free",
};

var atRegex = {
  domainName: "domain: *([^\\s]+)",
  updatedDate: "changed: *(.+)",
  registrar: "registrar: *(.+)",
  notFound: " nothing found",
  dateFormat: "YYYYMMDD hh:mm:ss",
  rateLimited: "Quota exceeded",
};

var caRegex = {
  domainName: "Domain Name: *([^\\s]+)",
  status: "Domain Status: *(.+)",
  updatedDate: "Updated Date: *(.+)",
  creationDate: "Creation Date: *(.+)",
  expirationDate: "Expiry Date: *(.+)",
  registrar: "Registrar: *(.+)",
  notFound: "Not found: ",
};

var beRegex = {
  domainName: "Domain:\\s*([^\\s]+)",
  registrar: "Registrar: *[\\n\\r]+\\s*Name:\\s*(.+)",
  status: "Status:\\s*(.+)",
  creationDate: "Registered: *(.+)",
  dateFormat: "ddd MMM DD YYYY",
  notFound: "Status:\\s*AVAILABLE",
};

var infoRegex = {
  domainName: "Domain Name: *([^\\s]+)",
  registrar: "Registrar: *(.+)",
  updatedDate: "Updated Date: *(.+)",
  creationDate: "Creation Date: *(.+)",
  expirationDate: "Registrar Registration Expiration Date: *(.+)",
  status: "Status: *(.+)",
  nameServers: "Name Server: *(.+)",
  notFound: "NOT FOUND",
  //'dateFormat':       'YYYY-MM-DDTHH:mm:ssZ'
};

var kgRegex = {
  domainName: "^Domain\\s*([^\\s]+)",
  registrar: "Domain support: \\s*(.+)",
  creationDate: "Record created:\\s*(.+)",
  expirationDate: "Record expires on:\\s*(.+)",
  updatedDate: "Record last updated on:\\s*(.+)",
  dateFormat: "ddd MMM DD HH:mm:ss YYYY",
  notFound: "domain is available for registration",
};

// var chRegex = {
//     'domainName':                      '\\nDomain name:\\n*([^\s]+)',
//     'registrar':                        'Registrar:\n*(.+)',
//     'creationDate':                    'First registration date:\\n*(.+)',
//     'rateLimited':                      'Please wait a moment and try again.',
//     'notFound':                         'We do not have an entry in our database matching your query',
//     'dateFormat':                       'YYYY-MM-DD'
// };

var idRegex = {
  domainName: "Domain Name:([^\\s]+)",
  creationDate: "Created On:(.+)",
  expirationDate: "Expiration Date(.+)",
  updatedDate: "Last Updated On(.+)",
  registrar: "Sponsoring Registrar Organization:(.+)",
  status: "Status:(.+)",
  notFound: "DOMAIN NOT FOUND",
  dateFormat: "DD-MMM-YYYY HH:mm:ss UTC",
};

var skRegex = {
  domainName: "Domain:\\s*([^\\s]+)",
  creationDate: "Created:\\s*(.+)",
  expirationDate: "Valid Until:\\s*(.+)",
  status: "EPP Status:\\s*(.+)",
  updatedDate: "Updated:\\s*(.+)",
  registrar: "Registrar:\\s*(.+)",
  dateFormat: "YYYY-MM-DD",
  notFound: "Domain not found",
};

var seRegex = {
  domainName: "domain\\.*: *([^\\s]+)",
  creationDate: "created\\.*: *(.+)",
  updatedDate: "modified\\.*: *(.+)",
  expirationDate: "expires\\.*: *(.+)",
  status: "status\\.*: *(.+)",
  registrar: "registrar: *(.+)",
  dateFormat: "YYYY-MM-DD",
  notFound: '\\" not found.',
};

var isRegex = {
  domainName: "domain\\.*: *([^\\s]+)",
  creationDate: "created\\.*: *(.+)",
  expirationDate: "expires\\.*: *(.+)",
  dateFormat: "MMM DD YYYY",
  notFound: "No entries found for query",
};

var coRegex = {
  domainName: "Domain Name: *([^\\s]+)",
  registrar: "Registrar: *(.+)",
  updatedDate: "Updated Date: *(.+)",
  creationDate: "Creation Date: *(.+)",
  expirationDate: "Expir\\w+ Date: *(.+)",
  status: "Status:\\s*(.+)\\s*\\n",
  nameServers: "Name Server: *(.+)",
  notFound: "No Data Found",
};

var trRegex = {
  domainName: "Domain Name: *([^\\s]+)",
  registrar: "Organization Name\t: *(.+)",
  creationDate: "Created on..............: *(.+)",
  expirationDate: "Expires on..............: *(.+)",
  dateFormat: "YYYY-MMM-DD",
  notFound: "No match found",
};

var parseRawData = function (rawData, domain) {
  if (rawData === null) {
    throw new Error("No Whois data received");
  } else if (rawData.length <= 10) {
    throw new Error('Bad WHOIS Data: "' + rawData + '"');
  }

  var result = { domainName: domain };

  var unknownTLD = false;
  var domainRegex = "";
  if (
    domain.endsWith(".com") ||
    domain.endsWith(".net") ||
    domain.endsWith(".name")
  ) {
    domainRegex = comRegex;
  } else if (
    domain.endsWith(".org") ||
    domain.endsWith(".me") ||
    domain.endsWith(".mobi")
  ) {
    domainRegex = orgRegex;
  } else if (domain.endsWith(".au")) {
    domainRegex = auRegex;
  } else if (
    domain.endsWith(".ru") ||
    domain.endsWith(".рф") ||
    domain.endsWith(".su")
  ) {
    domainRegex = ruRegex;
  } else if (domain.endsWith(".us") || domain.endsWith(".biz")) {
    domainRegex = usRegex;
  } else if (domain.endsWith(".uk")) {
    domainRegex = ukRegex;
  } else if (domain.endsWith(".fr")) {
    domainRegex = frRegex;
  } else if (domain.endsWith(".nl")) {
    domainRegex = nlRegex;
  } else if (domain.endsWith(".fi")) {
    domainRegex = fiRegex;
  } else if (domain.endsWith(".jp")) {
    domainRegex = jpRegex;
  } else if (domain.endsWith(".pl")) {
    domainRegex = plRegex;
  } else if (domain.endsWith(".br")) {
    domainRegex = brRegex;
  } else if (domain.endsWith(".eu")) {
    domainRegex = euRegex;
  } else if (domain.endsWith(".ee")) {
    domainRegex = eeRegex;
  } else if (domain.endsWith(".kr")) {
    domainRegex = krRegex;
  } else if (domain.endsWith(".bg")) {
    domainRegex = bgRegex;
  } else if (domain.endsWith(".de")) {
    domainRegex = deRegex;
  } else if (domain.endsWith(".at")) {
    domainRegex = atRegex;
  } else if (domain.endsWith(".ca")) {
    domainRegex = caRegex;
  } else if (domain.endsWith(".be")) {
    domainRegex = beRegex;
  } else if (domain.endsWith(".kg")) {
    domainRegex = kgRegex;
  } else if (domain.endsWith(".info")) {
    domainRegex = infoRegex;
    // } else if (domain.endsWith('.ch') || domain.endsWith('.li')) {
    //   domainRegex = infoRegex;
  } else if (domain.endsWith(".id")) {
    domainRegex = idRegex;
  } else if (domain.endsWith(".sk")) {
    domainRegex = skRegex;
  } else if (domain.endsWith(".se") || domain.endsWith(".nu")) {
    domainRegex = seRegex;
  } else if (domain.endsWith(".is")) {
    domainRegex = isRegex;
  } else if (domain.endsWith(".co")) {
    domainRegex = coRegex;
  } else if (domain.endsWith(".tr")) {
    domainRegex = trRegex;
  } else {
    domainRegex = defaultRegex;
    unknownTLD = true;
  }

  Object.keys(domainRegex).forEach(function (key) {
    // Find multiple matches for status field
    if (key === "status" || key === "nameServers") {
      var regex = new RegExp(domainRegex[key], "g");
    } else {
      var regex = new RegExp(domainRegex[key]);
    }

    if (rawData.match(regex) && key !== "dateFormat") {
      // dateformat not used for line matching
      if (key === "rateLimited") {
        throw new Error("Rate Limited");
      } else if (key === "notFound") {
        if (!result.hasOwnProperty("isAvailable")) {
          result["isAvailable"] = true;
        }
      } else {
        var value = rawData.match(regex)[rawData.match(regex).length - 1];
        if (key === "status") {
          var matches = [];
          while ((matches = regex.exec(rawData))) {
            if (result[key]) {
              result[key].push(matches[1]);
            } else {
              result[key] = [matches[1]];
            }
          }
        } else if (key === "nameServers") {
          var matches = [];
          while ((matches = regex.exec(rawData))) {
            if (result[key]) {
              result[key].push(matches[1]);
            } else {
              result[key] = [matches[1]];
            }
          }
        } else if (key === "expirationDate") {
          if (domainRegex.hasOwnProperty("dateFormat")) {
            result[key] = moment(value, domainRegex.dateFormat).toJSON();
          } else {
            result[key] = moment(value).toJSON();
          }
        } else if (key === "creationDate") {
          if (domainRegex.hasOwnProperty("dateFormat")) {
            result[key] = moment(value, domainRegex.dateFormat).toJSON();
          } else {
            result[key] = moment(value).toJSON();
          }
        } else if (key === "updatedDate") {
          if (domainRegex.hasOwnProperty("dateFormat")) {
            result[key] = moment(value, domainRegex.dateFormat).toJSON();
          } else {
            result[key] = moment(value).toJSON();
          }
        } else if (key === "domainName") {
          result[key] = value.toLowerCase();
        } else {
          result[key] = value;
        }
      }
    }
  });
  if (!result.hasOwnProperty("isAvailable")) {
    result.isAvailable = false;
  }

  // console.log('rawData: "' + rawData + '"');
  // console.log('result ' + JSON.stringify(result));

  // Check to make sure certain fields are set for unknown TLDs to ensure the default pattern matching worked
  // If not then throw TLD not supported error.
  if (unknownTLD) {
    if (!result.isAvailable) {
      if (
        !result.hasOwnProperty("creationDate") ||
        !result.hasOwnProperty("expirationDate") ||
        !result.hasOwnProperty("updatedDate") ||
        !result.hasOwnProperty("registrar")
      ) {
        throw new Error("TLD not supported");
      }
    }
  }
  return {
    ...result,
    raw: rawData,
  };
};

module.exports = parseRawData;
