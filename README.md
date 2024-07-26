<div align="center">

# 🧪 Next Whois UI
😎 Lightweight & Beautiful Whois Query Tool

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui)

</div>

## 😎 Features
No need to say more, just try it out! 🥳

### 🧠 Design
- Next.js  
- Shadcn UI & Tailwind CSS
- Whois Core Lib (@[whois-raw](https://www.npmjs.com/package/whois-raw))

## Deploy
#### 🚀 Platforms (Recommended)
[Vercel](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui) / [Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui) / [Zeabur](https://zeabur.com/templates/UHCCCT)
#### 🐳 Docker
```bash
docker run -d -p 3000:3000 programzmh/next-whois-ui
```

#### 🔨 Source Code
```bash
git clone https://github.com/zmh-program/next-whois-ui
cd next-whois-ui

npm install -g pnpm
pnpm install
pnpm dev
```

## 📏 Envs
- `NEXT_PUBLIC_HISTORY_LIMIT`: History Limit (Default: 6)
- `MAX_WHOIS_FOLLOW`: Max Whois Follow (Default: 0)

## 📝 API Reference
`GET` `/api/lookup?query=google.com`

<details>
<summary><strong>Response</strong> OK (200)</summary>

```json
{
  "time": 1.547,
  "status": true,
  "result": {
    "domain": "GOOGLE.COM",
    "registrar": "MarkMonitor Inc.",
    "registrarURL": "http://www.markmonitor.com",
    "ianaId": "292",
    "whoisServer": "whois.markmonitor.com",
    "updatedDate": "2019-09-09T15:39:04.000Z",
    "creationDate": "1997-09-15T04:00:00.000Z",
    "expirationDate": "2028-09-14T04:00:00.000Z",
    "status": [
      {
        "status": "clientDeleteProhibited",
        "url": "https://icann.org/epp#clientDeleteProhibited"
      },
      {
        "status": "clientTransferProhibited",
        "url": "https://icann.org/epp#clientTransferProhibited"
      },
      {
        "status": "clientUpdateProhibited",
        "url": "https://icann.org/epp#clientUpdateProhibited"
      },
      {
        "status": "serverDeleteProhibited",
        "url": "https://icann.org/epp#serverDeleteProhibited"
      },
      {
        "status": "serverTransferProhibited",
        "url": "https://icann.org/epp#serverTransferProhibited"
      },
      {
        "status": "serverUpdateProhibited",
        "url": "https://icann.org/epp#serverUpdateProhibited"
      }
    ],
    "nameServers": [
      "NS1.GOOGLE.COM",
      "NS2.GOOGLE.COM",
      "NS3.GOOGLE.COM",
      "NS4.GOOGLE.COM"
    ],
    "registrantOrganization": "Unknown",
    "registrantProvince": "Unknown",
    "registrantCountry": "Unknown",
    "registrantPhone": "+1 2086851750",
    "registrantEmail": "Unknown",
    "rawWhoisContent": "..."
  }
}
```
</details>

<details>
<summary><strong>Error Response</strong> Internal Server Error (500)</summary>

```json
{
  "time": 0.609,
  "status": false,
  "error": "No match for domain google.notfound (e.g. domain is not registered)"
}
```
</details>

<details>
<summary><strong>Error Response</strong> Bad Request (400)</summary>

```json
{
  "time": -1,
  "status": false,
  "error": "Query is required"
}
```
</details>


## 🤯 Roadmap
- [x] Open API
- [x] Domain Whois
- [x] Record History
- [x] Multi Theme Support
- [x] Mobile/Pad/PC Adaptation
- [ ] IPv4 & IPv6 Whois [#3](https://github.com/zmh-program/next-whois-ui/issues/3)
- [ ] Whois Cache & Retry [#4](https://github.com/zmh-program/next-whois-ui/issues/4)
- [ ] Result Capture [#5](https://github.com/zmh-program/next-whois-ui/issues/5)
- [ ] Internationalization [#6](https://github.com/zmh-program/next-whois-ui/issues/6)

👉 [Create Pull Request](https://github.com/zmh-program/next-whois-ui/pulls)
