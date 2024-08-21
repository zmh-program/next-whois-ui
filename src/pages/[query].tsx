import { lookupWhoisWithCache } from "@/lib/whois/lookup";
import {
  cleanDomainQuery,
  cn,
  getWindowHref,
  isEnter,
  toReadableISODate,
  toSearchURI,
  useClipboard,
} from "@/lib/utils";
import { NextPageContext } from "next";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Camera,
  CopyIcon,
  CornerDownRight,
  ExternalLink,
  Facebook,
  Link2,
  Loader2,
  Search,
  Send,
  Share2,
  ShieldIcon,
  ShieldOffIcon,
  ShieldQuestionIcon,
  Twitter,
  Unlink2,
} from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import React, { useEffect, useMemo } from "react";
import { addHistory } from "@/lib/history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VERSION } from "@/lib/env";
import { WhoisAnalyzeResult, WhoisResult } from "@/lib/whois/types";
import Icon from "@/components/icon";
import { useImageCapture } from "@/lib/image";
import ErrorArea from "@/components/items/error-area";
import RichTextarea from "@/components/items/rich-textarea";
import InfoText from "@/components/items/info-text";
import Clickable from "@/components/motion/clickable";

type Props = {
  data: WhoisResult;
  target: string;
  isCapture?: boolean;
};

export async function getServerSideProps(context: NextPageContext) {
  const { query } = context;
  const target: string = cleanDomainQuery(query);

  return {
    props: {
      data: await lookupWhoisWithCache(target),
      target,
    },
  };
}

type ResultTableProps = {
  result?: WhoisAnalyzeResult;
  target: string;
};

function getDnssecIcon(dnssec?: string) {
  if (!dnssec) {
    return <ShieldQuestionIcon />;
  }
  const key = dnssec.toLowerCase();

  switch (key) {
    case "unsigned":
      return <ShieldOffIcon />;
    case "signed":
      return <ShieldIcon />;
    default:
      return <ShieldQuestionIcon />;
  }
}

function ResultTable({ result, target }: ResultTableProps) {
  const Row = ({
    name,
    value,
    children,
    hidden,
    likeLink,
  }: {
    name: string;
    value: any;
    hidden?: boolean;
    children?: React.ReactNode;
    likeLink?: boolean;
  }) =>
    !hidden && (
      <tr>
        <td
          className={`py-1 pr-2 text-right font-medium text-secondary whitespace-pre-wrap md:w-36`}
        >
          {name}
        </td>
        <td
          className={cn(
            `py-1 pl-2 text-left text-primary whitespace-pre-wrap break-all`,
            likeLink && `cursor-pointer hover:underline`,
          )}
          onClick={() => {
            if (likeLink) {
              window.open(
                value.startsWith("http") ? value : `http://${value}`,
                "_blank",
                "noopener,noreferrer",
              );
            }
          }}
        >
          {value}
          {children}
        </td>
      </tr>
    );

  const StatusComp = () => {
    if (!result || result.status.length === 0) {
      return "N/A";
    }

    const status = useMemo(() => {
      const length = result.status.length;
      if (length > 3 && !expand) {
        return [
          ...result.status.slice(0, 3),
          {
            status: `...${length - 3} more`,
            url: "expand",
          },
        ];
      }

      return result.status;
    }, [result.status]);

    return (
      <div className={`inline-flex flex-row items-center flex-wrap`}>
        {status.map((status, index) => (
          <Link
            href={status.url}
            key={index}
            target={`_blank`}
            className={`inline-flex group flex-row whitespace-nowrap flex-nowrap items-center m-0.5 cursor-pointer px-1 py-0.5 border rounded text-xs`}
            onClick={(e) => {
              if (status.url === "expand") {
                e.preventDefault();
                setExpand(!expand);
              } else if (!status.url) {
                e.preventDefault();
              }
            }}
          >
            {status.url !== "expand" && (
              <Icon
                icon={status.url ? <Link2 /> : <Unlink2 />}
                className={`w-3 h-3 mr-1 shrink-0 text-muted-foreground transition group-hover:text-primary`}
              />
            )}
            {status.status}
          </Link>
        ))}
      </div>
    );
  };

  const [expand, setExpand] = React.useState<boolean>(false);
  const copy = useClipboard();

  return (
    result && (
      <table className={`w-full text-sm mb-4 whitespace-pre-wrap`}>
        <tbody>
          <Row name={`Name`} value={result.domain || target.toUpperCase()} />
          <Row name={`Status`} value={<StatusComp />} />
          <Row
            name={`Registrar`}
            value={result.registrar}
            hidden={!result.registrar || result.registrar === "Unknown"}
          />
          <Row
            name={`Registrar URL`}
            value={result.registrarURL}
            likeLink
            hidden={!result.registrarURL || result.registrarURL === "Unknown"}
          />
          <Row
            name={`IANA ID`}
            value={result.ianaId}
            hidden={!result.ianaId || result.ianaId === "N/A"}
          >
            <Link
              className={`inline-flex ml-1`}
              href={`https://www.internic.net/registrars/registrar-${result.ianaId ?? 0}.html`}
              target={`_blank`}
            >
              <Button variant={`ghost`} size={`icon-xs`}>
                <ExternalLink className={`w-3 h-3`} />
              </Button>
            </Link>
          </Row>

          {/* IP Whois Only */}
          <Row
            name={`CIDR`}
            value={result.cidr}
            hidden={!result.cidr || result.cidr === "Unknown"}
          />
          <Row
            name={`Net Type`}
            value={result.netType}
            hidden={!result.netType || result.netType === "Unknown"}
          />
          <Row
            name={`Net Name`}
            value={result.netName}
            hidden={!result.netName || result.netName === "Unknown"}
          />
          <Row
            name={`INet Num`}
            value={result.inetNum}
            hidden={!result.inetNum || result.inetNum === "Unknown"}
          />
          <Row
            name={`INet6 Num`}
            value={result.inet6Num}
            hidden={!result.inet6Num || result.inet6Num === "Unknown"}
          />
          <Row
            name={`Net Range`}
            value={result.netRange}
            hidden={!result.netRange || result.netRange === "Unknown"}
          />
          <Row
            name={`Origin AS`}
            value={result.originAS}
            hidden={!result.originAS || result.originAS === "Unknown"}
          />
          {/* IP Whois Only End */}

          <Row
            name={`Whois Server`}
            value={result.whoisServer}
            likeLink
            hidden={!result.whoisServer || result.whoisServer === "Unknown"}
          />

          <Row
            name={`Creation Date`}
            value={toReadableISODate(result.creationDate)}
            hidden={!result.creationDate || result.creationDate === "Unknown"}
          >
            <InfoText content={`UTC`} />
          </Row>
          <Row
            name={`Updated Date`}
            value={toReadableISODate(result.updatedDate)}
            hidden={!result.updatedDate || result.updatedDate === "Unknown"}
          >
            <InfoText content={`UTC`} />
          </Row>
          <Row
            name={`Expiration Date`}
            value={toReadableISODate(result.expirationDate)}
            hidden={
              !result.expirationDate || result.expirationDate === "Unknown"
            }
          >
            <InfoText content={`UTC`} />
          </Row>
          <Row
            name={`Registrant Organization`}
            value={result.registrantOrganization}
            hidden={
              !result.registrantOrganization ||
              result.registrantOrganization === "Unknown"
            }
          />
          <Row
            name={`Registrant Province`}
            value={result.registrantProvince}
            hidden={
              !result.registrantProvince ||
              result.registrantProvince === "Unknown"
            }
          />
          <Row
            name={`Registrant Country`}
            value={result.registrantCountry}
            hidden={
              !result.registrantCountry ||
              result.registrantCountry === "Unknown"
            }
          />
          <Row
            name={`Registrant Phone`}
            value={result.registrantPhone}
            hidden={
              !result.registrantPhone || result.registrantPhone === "Unknown"
            }
          >
            <InfoText content={`Abuse`} />
          </Row>
          <Row
            name={`Registrant Email`}
            value={result.registrantEmail}
            hidden={
              !result.registrantEmail || result.registrantEmail === "Unknown"
            }
          />
          <Row
            name={`Name Servers`}
            value={
              <div className={`flex flex-col`}>
                {result.nameServers.map((ns, index) => (
                  <div
                    key={index}
                    className={`text-secondary hover:text-primary transition duration-500 text-xs border cursor-pointer rounded-md px-1 py-0.5 mt-0.5 w-fit inline-flex flex-row items-center`}
                    onClick={() => copy(ns)}
                  >
                    <CopyIcon className={`w-2.5 h-2.5 mr-1`} />
                    {ns}
                  </div>
                ))}
              </div>
            }
            hidden={result.nameServers.length === 0}
          />
          <Row name={`DNSSEC`} value={result.dnssec} hidden={!result.dnssec}>
            <Icon
              className={`inline w-3.5 h-3.5 ml-1.5`}
              icon={getDnssecIcon(result.dnssec)}
            />
          </Row>
        </tbody>
      </table>
    )
  );
}

const ResultComp = React.forwardRef<HTMLDivElement, Props>(
  ({ data, target, isCapture }: Props, ref) => {
    const copy = useClipboard();

    const captureObject = React.useRef<HTMLDivElement>(null);
    const capture = useImageCapture(captureObject);

    const { status, result, error, time } = data;

    const current = getWindowHref();

    return (
      <div
        className={cn(
          "w-full h-fit mt-2",
          isCapture &&
            "flex flex-col items-center m-0 p-4 w-full bg-background",
        )}
      >
        {!isCapture && (
          <div
            className={`inline-flex flex-row items-center w-full h-fit select-none mb-1 space-x-1`}
          >
            <div className={`flex-grow`} />
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  variant={`outline`}
                  size={`icon-sm`}
                  className={`transition duration-500 hover:border-muted-foreground shadow-sm`}
                  tapEnabled
                >
                  <Camera className={`w-4 h-4 stroke-[1.5]`} />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle
                    className={`inline-flex items-center justify-center`}
                  >
                    <Camera className={`w-5 h-5 stroke-[1.5] mr-1.5`} />
                    Capture
                  </DrawerTitle>
                  <DrawerClose />
                </DrawerHeader>
                <div className={`my-2`}>
                  <ResultComp
                    data={data}
                    target={target}
                    ref={captureObject}
                    isCapture={true}
                  />
                </div>
                <DrawerFooter>
                  <Button
                    variant={`outline`}
                    onClick={() => capture(`whois-${target}`)}
                    className={`flex flex-row items-center w-full max-w-[568px] mx-auto`}
                    tapEnabled
                  >
                    <Camera className={`w-4 h-4 mr-2`} />
                    Capture
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  variant={`outline`}
                  size={`icon-sm`}
                  className={`transition duration-500 hover:border-muted-foreground shadow-sm`}
                  tapEnabled
                >
                  <Share2 className={`w-4 h-4 stroke-[1.5]`} />
                </Button>
              </DrawerTrigger>
              <DrawerContent className={`w-full text-center`}>
                <DrawerHeader>
                  <DrawerTitle
                    className={`inline-flex items-center justify-center`}
                  >
                    <Share2 className={`w-4 h-4 stroke-[1.5] mr-1.5`} />
                    Share
                  </DrawerTitle>
                  <DrawerClose />
                </DrawerHeader>
                <DrawerDescription>
                  <p className={`text-sm text-secondary`}>
                    Share the result with others
                  </p>
                </DrawerDescription>

                <div
                  className={`flex flex-row items-center w-full max-w-[468px] mx-auto mt-4 justify-center space-x-2`}
                >
                  {/* twitter */}
                  <Link
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      `Whois Lookup Result: ${target} - ${status ? "Success" : "Failed"}`,
                    )}&url=${encodeURIComponent(current)}`}
                    target={`_blank`}
                  >
                    <Button size={`icon-sm`} variant={`outline`} tapEnabled>
                      <svg
                        role="img"
                        className="h-3.5 w-3.5 fill-primary"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <title>X</title>
                        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                      </svg>
                    </Button>
                  </Link>

                  {/*  facebook */}
                  <Link
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      current,
                    )}`}
                    target={`_blank`}
                  >
                    <Button size={`icon-sm`} variant={`outline`} tapEnabled>
                      <svg
                        role="img"
                        className="h-4 w-4 fill-primary"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <title>Facebook</title>
                        <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
                      </svg>
                    </Button>
                  </Link>

                  {/*  reddit */}
                  <Link
                    href={`https://reddit.com/submit?url=${encodeURIComponent(
                      current,
                    )}`}
                    target={`_blank`}
                  >
                    <Button size={`icon-sm`} variant={`outline`} tapEnabled>
                      <svg
                        role="img"
                        className="h-4 w-4 fill-primary"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <title>Reddit</title>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z" />
                      </svg>
                    </Button>
                  </Link>

                  {/*  whatsapp */}
                  <Link
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      current,
                    )}`}
                    target={`_blank`}
                  >
                    <Button size={`icon-sm`} variant={`outline`} tapEnabled>
                      <svg
                        role="img"
                        className="h-4 w-4 fill-primary"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <title>WhatsApp</title>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </Button>
                  </Link>

                  {/*  telegram */}
                  <Link
                    href={`https://t.me/share/url?url=${encodeURIComponent(
                      current,
                    )}`}
                    target={`_blank`}
                  >
                    <Button size={`icon-sm`} variant={`outline`} tapEnabled>
                      <svg
                        role="img"
                        className="h-4 w-4 fill-primary"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <title>Telegram</title>
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                    </Button>
                  </Link>
                </div>
                <DrawerFooter>
                  <div
                    className={`flex flex-row items-center w-full max-w-[468px] mx-auto`}
                  >
                    <Input
                      className={`flex-grow border-r-0 rounded-r-none text-center`}
                      value={current}
                      readOnly
                    />
                    <Button
                      size={`icon`}
                      variant={`secondary`}
                      onClick={() => copy(current)}
                      className={`rounded-l-none`}
                      tapEnabled
                    >
                      <CopyIcon className={`w-4 h-4`} />
                    </Button>
                  </div>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        )}
        <Card
          ref={ref}
          className={cn(isCapture ? "w-full max-w-[568px]" : "shadow")}
        >
          <CardHeader>
            <CardTitle
              className={`flex flex-row items-center text-lg md:text-xl`}
            >
              Result
              <div className={`flex-grow`} />
              <Clickable className={`w-fit h-fit inline-flex ml-2 mr-1`}>
                <Badge
                  className={cn(
                    `inline-flex max-w-36 md:max-w-64 flex-row items-center space-x-1 cursor-pointer select-none`,
                    isCapture && "max-w-72",
                  )}
                  onClick={() => copy(target)}
                >
                  <div
                    className={cn(
                      "w-2 h-2 shrink-0 rounded-full",
                      status ? "bg-green-500" : "bg-red-500",
                    )}
                  />
                  <p
                    className={cn(
                      `grow`,
                      !isCapture && `text-ellipsis overflow-hidden`,
                    )}
                  >
                    {target}
                  </p>
                </Badge>
              </Clickable>
              <Badge variant={`outline`}>{time.toFixed(2)}s</Badge>
            </CardTitle>
            <CardContent className={`w-full p-0`}>
              {!status ? (
                <ErrorArea error={error} />
              ) : (
                <div className={`flex flex-col h-fit w-full mt-2`}>
                  <ResultTable result={result} target={target} />

                  {!isCapture && (
                    <RichTextarea
                      className={`mt-2`}
                      name={`Raw Whois Response`}
                      value={result?.rawWhoisContent}
                      saveFileName={`${target.replace(/\./g, "-")}-whois.txt`}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    );
  },
);

export default function Lookup({ data, target }: Props) {
  const [inputDomain, setInputDomain] = React.useState<string>(target);
  const [loading, setLoading] = React.useState<boolean>(false);

  const goStage = (target: string) => {
    setLoading(true);
    window.location.href = toSearchURI(inputDomain);
  };

  useEffect(() => {
    addHistory(target);
  }, []);

  return (
    <ScrollArea className={`w-full h-full`}>
      <main
        className={
          "relative w-full min-h-full grid place-items-center px-4 pt-24 pb-6"
        }
      >
        <div
          className={
            "flex flex-col items-center w-full h-fit max-w-[568px] m-2"
          }
        >
          <h1
            className={
              "text-lg md:text-2xl lg:text-3xl font-bold flex flex-row items-center select-none"
            }
          >
            <Search
              className={`w-4 h-4 md:w-6 md:h-6 mr-1 md:mr-1.5 shrink-0`}
            />
            Whois Lookup
          </h1>
          <p className={"text-md text-center text-secondary"}>
            Please enter a domain name to lookup
          </p>
          <div className={"relative flex flex-row items-center w-full mt-2"}>
            <Input
              className={`w-full text-center transition-all duration-300 hover:shadow`}
              placeholder={`domain name (e.g. google.com, 8.8.8.8)`}
              value={inputDomain}
              onChange={(e) => setInputDomain(e.target.value)}
              onKeyDown={(e) => {
                if (isEnter(e)) {
                  goStage(inputDomain);
                }
              }}
            />
            <Button
              size={`icon`}
              variant={`outline`}
              className={`absolute right-0 rounded-l-none`}
              onClick={() => goStage(inputDomain)}
            >
              {loading ? (
                <Loader2 className={`w-4 h-4 animate-spin`} />
              ) : (
                <Send className={`w-4 h-4`} />
              )}
            </Button>
          </div>
          <div
            className={cn(
              `flex items-center flex-row w-full text-xs mt-1.5 select-none text-secondary transition`,
              loading && "text-primary",
            )}
          >
            <div className={`flex-grow`} />
            <CornerDownRight className={`w-3 h-3 mr-1`} />
            <p className={`px-1 py-0.5 border rounded-md`}>Enter</p>
          </div>
          <ResultComp data={data} target={target} />
        </div>
        <div
          className={`mt-12 text-sm flex flex-row items-center font-medium text-muted-foreground select-none`}
        >
          Powered by{" "}
          <Link
            href={`https://github.com/zmh-program/next-whois-ui`}
            target={`_blank`}
            className={`text-primary underline underline-offset-2 mx-1`}
          >
            Next Whois UI
          </Link>
          <Badge variant={`outline`}>v{VERSION}</Badge>
        </div>
      </main>
    </ScrollArea>
  );
}
