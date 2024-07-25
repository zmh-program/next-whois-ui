import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  CornerDownRight,
  Link2,
  Loader2,
  Search,
  Send,
} from "lucide-react";
import React, { useEffect } from "react";
import Link from "next/link";
import { cn, isEnter, toSearchURI } from "@/lib/utils";
import { addHistory, listHistory } from "@/lib/history";

export default function Home() {
  const [domain, setDomain] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [history, setHistory] = React.useState<string[]>([]);

  useEffect(() => setHistory(listHistory()), []);

  const goStage = (target: string) => {
    setLoading(true);
    addHistory(target);
  };

  return (
    <main className={"w-full h-full grid place-items-center p-4 md:p-6"}>
      <div className={"flex flex-col items-center w-full h-fit max-w-[568px]"}>
        <h1
          className={
            "text-lg md:text-2xl lg:text-3xl font-bold flex flex-row items-center select-none"
          }
        >
          <Search className={`w-4 h-4 md:w-6 md:h-6 mr-1 md:mr-1.5 shrink-0`} />
          Whois Lookup
        </h1>
        <p className={"text-md text-center text-secondary"}>
          Please enter a domain name to lookup
        </p>
        <div className={"relative flex flex-row items-center w-full mt-2"}>
          <Input
            className={`w-full text-center`}
            placeholder={`domain name (e.g. google.com)`}
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => {
              if (isEnter(e)) {
                goStage(domain);
                window.location.href = toSearchURI(domain);
              }
            }}
          />
          <Link
            href={toSearchURI(domain)}
            className={`absolute right-0`}
            onClick={() => goStage(domain)}
          >
            <Button
              size={`icon`}
              variant={`outline`}
              className={`rounded-l-none`}
            >
              {loading ? (
                <Loader2 className={`w-4 h-4 animate-spin`} />
              ) : (
                <Send className={`w-4 h-4`} />
              )}
            </Button>
          </Link>
        </div>
        <div
          className={`flex items-center flex-row w-full text-xs mt-1.5 select-none text-secondary`}
        >
          <div className={`flex-grow`} />
          <CornerDownRight className={`w-3 h-3 mr-1`} />
          <p className={`px-1 py-0.5 border rounded-md`}>Enter</p>
        </div>
        {history.length > 0 && (
          <div
            className={`mt-6 md:mt-8 grid grid-cols-2 gap-2 w-full h-fit border-t pt-6`}
          >
            {history.map((item, index) => (
              <Link
                className={cn(
                  `text-sm w-full h-full`,
                  `flex flex-row items-center`,
                  `border rounded-md pl-3.5 pr-2.5 py-2 text-secondary`,
                  `group transition duration-500 ease-in-out`,
                  `hover:bg-background hover:text-primary hover:border-hover`,
                )}
                href={toSearchURI(item)}
                key={index}
                onClick={() => goStage(item)}
              >
                <Link2 className={`w-4 h-4 mr-1`} />
                {item}
                <ChevronRight
                  className={`transition-all w-4 h-4 ml-auto mr-1 group-hover:mr-0`}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
