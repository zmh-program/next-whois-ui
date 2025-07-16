import { MOZ_ACCESS_ID, MOZ_SECRET_KEY } from "@/lib/env";

interface MozMetrics {
  domainAuthority: number;
  pageAuthority: number;
  spamScore: number;
}

const MOZ_API_URL = "https://lsapi.seomoz.com/v2";

async function generateAuthToken(): Promise<string> {
  const credentials = Buffer.from(
    `${MOZ_ACCESS_ID}:${MOZ_SECRET_KEY}`,
  ).toString("base64");
  return `Basic ${credentials}`;
}

export async function getMozMetrics(domain: string): Promise<MozMetrics> {
  try {
    if (!MOZ_ACCESS_ID || !MOZ_SECRET_KEY) {
      return {
        domainAuthority: -1,
        pageAuthority: -1,
        spamScore: -1,
      };
    }

    const authToken = await generateAuthToken();

    // Get Domain Authority
    const daResponse = await fetch(`${MOZ_API_URL}/url_metrics`, {
      method: "POST",
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        targets: [`https://${domain}`],
        metrics: ["domain_authority", "page_authority", "spam_score"],
      }),
    });

    if (!daResponse.ok) {
      throw new Error(`Moz API error: ${daResponse.statusText}`);
    }

    const data = await daResponse.json();
    const metrics = data.results[0];

    return {
      domainAuthority: Math.round(metrics.domain_authority || 0),
      pageAuthority: Math.round(metrics.page_authority || 0),
      spamScore: Math.round(metrics.spam_score || 0),
    };
  } catch (error) {
    console.error("Error fetching Moz metrics:", error);
    return {
      domainAuthority: 0,
      pageAuthority: 0,
      spamScore: 0,
    };
  }
}
