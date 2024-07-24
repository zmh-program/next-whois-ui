import { lookupWhois, WhoisAnalyzeResult, WhoisResult } from "@/lib/whois";
import { cn, isEnter, toSearchURI, useClipboard } from "@/lib/utils";
import { NextPageContext } from "next";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CircleX,
  CopyIcon,
  CornerDownRight,
  ExternalLink,
  Loader2,
  Send,
  X,
} from "lucide-react";
import React from "react";
import { addHistory } from "@/lib/history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TextArea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type Props = {
  data: WhoisResult;
  target: string;
};

export async function getServerSideProps(context: NextPageContext) {
  const { query } = context;
  const target: string = typeof query.query === "string" ? query.query : "";

  return {
    props: {
      data: await lookupWhois(target),
      target,
    },
  };
}

type ErrorAreaProps = {
  error: string;
};

function ErrorArea({ error }: ErrorAreaProps) {
  const copy = useClipboard();

  return (
    <div
      className={`flex flex-col items-center w-full h-fit mt-2 p-2 border border-red-500 rounded-md text-red-500`}
    >
      <div className={`text-md inline-flex flex-row items-center`}>
        <CircleX className={`w-3.5 h-3.5 mr-1`} />
        Lookup Failed
      </div>
      <div className={`text-sm mt-2 text-center`}>
        <div
          className={`inline-block mr-1 w-3 h-3 cursor-pointer`}
          onClick={() => copy(error)}
        >
          <CopyIcon className={`w-3 h-3`} />
        </div>
        {error}
      </div>
    </div>
  );
}

type ResultTableProps = {
  result?: WhoisAnalyzeResult;
};

function ResultTable({ result }: ResultTableProps) {
  const Row = ({
    name,
    value,
    children,
  }: {
    name: string;
    value: any;
    children?: React.ReactNode;
  }) => (
    <tr>
      <td
        className={`py-1 pr-2 text-right font-medium text-secondary whitespace-pre-wrap`}
      >
        {name}
      </td>
      <td
        className={`py-1 pl-2 text-left text-primary whitespace-pre-wrap break-all`}
      >
        {value}
        {children}
      </td>
    </tr>
  );

  return (
    result && (
      <table className={`w-full text-sm mb-4 whitespace-pre-wrap`}>
        <tbody>
          <Row name={`Domain`} value={result.domain} />
          <Row
            name={`Status`}
            value={
              result.status.length > 0 ? (
                <div className={`inline-flex flex-row items-center flex-wrap`}>
                  {result.status.map((status, index) => (
                    <Link
                      href={status.url}
                      key={index}
                      className={`inline-block m-0.5 cursor-pointer px-1 py-0.5 border rounded text-xs`}
                    >
                      {status.status}
                    </Link>
                  ))}
                </div>
              ) : (
                "N/A"
              )
            }
          />
          <Row name={`Registrar`} value={result.registrar} />
          <Row name={`Registrar URL`} value={result.registrarURL} />
          <Row name={`IANA ID`} value={result.ianaId}>
            <Link
              className={`inline-flex ml-1`}
              href={`https://www.internic.net/registrars/registrar-${result.ianaId}.html`}
              target={`_blank`}
            >
              <Button variant={`ghost`} size={`icon-xs`}>
                <ExternalLink className={`w-3 h-3`} />
              </Button>
            </Link>
          </Row>
          <Row name={`Whois Server`} value={result.whoisServer} />
          <Row name={`Updated Date`} value={result.updatedDate} />
          <Row name={`Creation Date`} value={result.creationDate} />
          <Row name={`Expiration Date`} value={result.expirationDate} />
          <Row
            name={`Registrant Organization`}
            value={result.registrantOrganization}
          />
          <Row name={`Registrant Province`} value={result.registrantProvince} />
          <Row name={`Registrant Country`} value={result.registrantCountry} />
          <Row name={`Registrant Phone`} value={result.registrantPhone} />
          <Row name={`Registrant Email`} value={result.registrantEmail} />
        </tbody>
      </table>
    )
  );
}

function ResultComp({ data, target }: Props) {
  const copy = useClipboard();
  const { status, result, error, time } = data;

  return (
    <Card className={`w-full h-fit mt-4`}>
      <CardHeader>
        <CardTitle className={`flex flex-row items-center`}>
          Result
          <div className={`flex-grow`} />
          <Badge
            className={`inline-flex flex-row items-center cursor-pointer mr-1`}
            onClick={() => copy(target)}
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full mr-1",
                status ? "bg-green-500" : "bg-red-500",
              )}
            />
            {target}
          </Badge>
          <Badge variant={`outline`}>{time.toFixed(1)}s</Badge>
        </CardTitle>
        <CardContent className={`w-full p-0`}>
          {!status ? (
            <ErrorArea error={error || ""} />
          ) : (
            <div className={`flex flex-col h-fit w-full`}>
              <ResultTable result={result} />
              <Separator />
              <div className={`flex flex-row items-center mt-2 mb-1.5`}>
                <div className={`flex-grow`} />
                <Button
                  variant={`outline`}
                  size={`icon-sm`}
                  onClick={() => copy(result?.rawWhoisContent || "")}
                >
                  <CopyIcon className={`w-3 h-3`} />
                </Button>
              </div>
              <TextArea
                rows={10}
                readOnly={true}
                value={result?.rawWhoisContent || ""}
              />
            </div>
          )}
        </CardContent>
      </CardHeader>
    </Card>
  );
}

export default function Lookup({ data, target }: Props) {
  const [inputDomain, setInputDomain] = React.useState<string>(target);
  const [loading, setLoading] = React.useState<boolean>(false);

  const goStage = (target: string) => {
    setLoading(true);
    addHistory(target);
  };

  return (
    <ScrollArea className={`w-full h-full`}>
      <main
        className={
          "w-full min-h-full grid place-items-center px-4 md:px-6 py-8 md:py-[10vh]"
        }
      >
        <div
          className={"flex flex-col items-center w-full h-fit max-w-[568px]"}
        >
          <h1 className={"text-lg md:text-2xl lg:text-3xl font-bold"}>
            Whois Lookup
          </h1>
          <p className={"text-md text-center text-secondary"}>
            Please enter a domain name to lookup
          </p>
          <div className={"relative flex flex-row items-center w-full mt-2"}>
            <Input
              className={`w-full text-center`}
              placeholder={`domain name (e.g. google.com)`}
              value={inputDomain}
              onChange={(e) => setInputDomain(e.target.value)}
              onKeyDown={(e) => {
                if (isEnter(e)) {
                  goStage(inputDomain);
                  window.location.href = toSearchURI(inputDomain);
                }
              }}
            />
            <Link
              href={toSearchURI(inputDomain)}
              className={`absolute right-0`}
              onClick={() => goStage(inputDomain)}
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
          <ResultComp data={data} target={target} />
        </div>
      </main>
    </ScrollArea>
  );
}
