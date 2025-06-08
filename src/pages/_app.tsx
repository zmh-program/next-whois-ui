import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { strEnv } from "@/lib/env";
import { inter } from "@/lib/fonts";
import PWAInstaller from "@/components/pwa_installer";
import { Navbar } from "@/components/navbar";

const siteTitle = strEnv("NEXT_PUBLIC_SITE_TITLE", "Next Whois UI");
const siteDescription = strEnv(
  "NEXT_PUBLIC_SITE_DESCRIPTION",
  "🧪 Your Next Generation Of Whois Lookup Tool With Modern UI. Support Domain/IPv4/IPv6/ASN/CIDR Whois Lookup And Powerful Features.",
);
const siteKeywords = strEnv(
  "NEXT_PUBLIC_SITE_KEYWORDS",
  "Whois, Lookup, Tool, Next Whois UI",
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <meta name="tags" content={siteKeywords} />
        <meta name="keywords" content={siteKeywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Toaster />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <PWAInstaller
          manifest-url="/manifest.json"
          name="Next Whois UI"
          description="🧪 Your Next Generation Of Whois Lookup Tool With Modern UI. Support Domain/IPv4/IPv6/ASN/CIDR Whois Lookup And Powerful Features."
        />
        <div className={cn(`relative w-full min-h-screen`, inter.className)}>
          <Navbar />
          <main className="pt-16">
            <Component {...pageProps} />
          </main>
        </div>
      </ThemeProvider>
    </>
  );
}
