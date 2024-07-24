import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Next Whois Lookup</title>
        <meta
          name="description"
          content="Next Whois Lookup Tool, Provided Beautiful, Clean and Simple UI"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="tags" content="Whois, Lookup, Tool, Next Whois UI" />
      </Head>
      <Toaster />
      <div className={cn(`w-full h-full`, inter.className)}>
        <Component {...pageProps} />
      </div>
    </>
  );
}
