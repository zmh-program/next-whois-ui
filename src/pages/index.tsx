import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  RiArrowRightSLine,
  RiLinkM,
  RiSearchLine,
  RiDeleteBinLine,
  RiArrowGoBackLine,
  RiFilterLine,
  RiTimeLine,
  RiSortAsc,
  RiSortDesc,
  RiHistoryLine,
  RiInformationLine,
  RiArrowLeftSLine,
} from "@remixicon/react";
import React, { useEffect } from "react";
import Link from "next/link";
import { cn, toSearchURI } from "@/lib/utils";
import {
  HistoryItem,
  listHistory,
  removeHistory,
  searchHistory,
} from "@/lib/history";
import Icon from "@/components/icon";
import Clickable from "@/components/motion/clickable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBox } from "@/components/search_box";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Home() {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [trashMode, setTrashMode] = React.useState<boolean>(false);
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [selectedType, setSelectedType] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const items = searchTerm ? searchHistory(searchTerm) : listHistory();
    const filtered =
      selectedType === "all"
        ? items
        : items.filter((item) => item.queryType === selectedType);
    const sorted = [...filtered].sort((a, b) => {
      return sortOrder === "desc"
        ? b.timestamp - a.timestamp
        : a.timestamp - b.timestamp;
    });
    setHistory(sorted);
  }, [searchTerm, sortOrder, selectedType]);

  const handleSearch = (query: string) => {
    setLoading(true);
    window.location.href = toSearchURI(query);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "domain":
        return "text-blue-500";
      case "ipv4":
        return "text-green-500";
      case "ipv6":
        return "text-purple-500";
      case "asn":
        return "text-orange-500";
      case "cidr":
        return "text-pink-500";
      default:
        return "text-gray-500";
    }
  };

  useEffect(() => {
    const totalPages = Math.ceil(history.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [history, currentPage, itemsPerPage]);

  return (
    <main className={"w-full h-full grid place-items-center p-4 md:p-6"}>
      <div className={"flex flex-col items-center w-full h-fit max-w-[568px]"}>
        <h1
          className={
            "text-lg md:text-xl lg:text-2xl font-thin flex flex-row items-center select-none"
          }
        >
          Next Whois Lookup
        </h1>
        <div className={"w-full mt-2"}>
          <SearchBox onSearch={handleSearch} loading={loading} autoFocus />
        </div>

        <div className="w-full flex flex-row items-center justify-between mt-8 mb-2">
          <div className="flex flex-row items-center gap-3">
            <div className="relative">
              <Input
                className="w-24 sm:w-48 lg:w-64 h-8 text-xs pl-8 border-dashed focus:border-solid"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="relative border-dashed hover:border-solid"
                >
                  <RiFilterLine className="h-3.5 w-3.5" />
                  {selectedType !== "all" && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  FILTER BY TYPE
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1.5" />
                <DropdownMenuRadioGroup
                  value={selectedType}
                  onValueChange={setSelectedType}
                >
                  <DropdownMenuRadioItem value="all" className="text-xs">
                    All Types
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="domain" className="text-xs">
                    Domain Only
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ipv4" className="text-xs">
                    IPv4 Only
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ipv6" className="text-xs">
                    IPv6 Only
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="asn" className="text-xs">
                    ASN Only
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="cidr" className="text-xs">
                    CIDR Only
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="relative group border-dashed hover:border-solid"
            >
              {sortOrder === "asc" ? (
                <RiSortAsc className="h-3.5 w-3.5" />
              ) : (
                <RiSortDesc className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setTrashMode(!trashMode)}
              className={cn(
                "relative group border-dashed hover:border-solid",
                trashMode &&
                  "bg-destructive/5 hover:bg-destructive/10 text-destructive border-destructive",
              )}
            >
              <Icon
                icon={trashMode ? <RiArrowGoBackLine /> : <RiDeleteBinLine />}
                className="w-3.5 h-3.5"
              />
            </Button>
          </div>
        </div>
        {history.length > 0 ? (
          <>
            <div className="w-full grid grid-cols-1 gap-2.5">
              {history
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage,
                )
                .map((item, index) => (
                  <Clickable tapScale={0.985} key={index}>
                    <Card
                      className={cn(
                        "group transition-all duration-300 hover:shadow-sm border-dashed",
                        "bg-secondary/25 hover:bg-secondary/50",
                        trashMode &&
                          "hover:border-destructive hover:border-solid",
                      )}
                    >
                      <CardContent className="p-3">
                        <Link
                          className="flex flex-row items-center"
                          href={toSearchURI(item.query)}
                          onClick={(e) => {
                            if (trashMode) {
                              e.preventDefault();
                              removeHistory(item.query);
                              setHistory(listHistory());
                              return;
                            } else {
                              handleSearch(item.query);
                            }
                          }}
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full grid place-items-center border-2 border-dashed shrink-0",
                              trashMode
                                ? "border-destructive/50"
                                : `${getTypeColor(item.queryType)}/50`,
                            )}
                          >
                            <Icon
                              icon={
                                !trashMode ? <RiLinkM /> : <RiDeleteBinLine />
                              }
                              className={cn(
                                "w-3.5 h-3.5",
                                trashMode
                                  ? "text-destructive"
                                  : getTypeColor(item.queryType),
                              )}
                            />
                          </div>
                          <div className="ml-3 flex-grow">
                            <div className="flex items-center">
                              <p className="text-sm font-medium tracking-wide">
                                {item.query}
                              </p>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "ml-2 text-[10px] px-1.5 py-0 font-normal border-dashed",
                                  getTypeColor(item.queryType),
                                )}
                              >
                                {item.queryType.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center mt-1.5 space-x-3 text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <RiTimeLine className="w-3 h-3 mr-1" />
                                <span>
                                  {format(item.timestamp, "MMM dd, yyyy")}
                                </span>
                              </div>
                              <div className="w-1 h-1 rounded-full bg-muted" />
                              <span>{format(item.timestamp, "HH:mm")}</span>
                            </div>
                          </div>
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full grid place-items-center ml-2 transition-all duration-300",
                              "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100",
                              "border border-dashed",
                              trashMode
                                ? "border-destructive/50"
                                : "border-primary/50",
                            )}
                          >
                            <RiArrowRightSLine
                              className={cn(
                                "w-3.5 h-3.5",
                                trashMode ? "text-destructive" : "text-primary",
                              )}
                            />
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  </Clickable>
                ))}
            </div>
            {history.length > itemsPerPage && (
              <Pagination className="mt-2 justify-end">
                <PaginationContent className="gap-1">
                  <PaginationItem className="hidden sm:inline-block">
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      className={cn(
                        "border border-dashed hover:border-solid h-7 min-w-7 px-2 text-xs",
                        currentPage === 1 && "pointer-events-none opacity-50",
                      )}
                    />
                  </PaginationItem>
                  {(() => {
                    const totalPages = Math.ceil(history.length / itemsPerPage);
                    const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;
                    const pages = [];

                    if (totalPages <= maxVisiblePages) {
                      // Show all pages if total is less than max visible
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Complex logic for showing pages with ellipsis
                      if (currentPage <= 3) {
                        // Near start
                        for (let i = 1; i <= 3; i++) pages.push(i);
                        pages.push("ellipsis");
                        pages.push(totalPages);
                      } else if (currentPage >= totalPages - 2) {
                        // Near end
                        pages.push(1);
                        pages.push("ellipsis");
                        for (let i = totalPages - 2; i <= totalPages; i++)
                          pages.push(i);
                      } else {
                        // Middle
                        pages.push(1);
                        pages.push("ellipsis");
                        pages.push(currentPage - 1);
                        pages.push(currentPage);
                        pages.push(currentPage + 1);
                        pages.push("ellipsis");
                        pages.push(totalPages);
                      }
                    }

                    return pages.map((page, index) => (
                      <PaginationItem key={index}>
                        {page === "ellipsis" ? (
                          <PaginationEllipsis className="h-7 min-w-7 text-xs" />
                        ) : (
                          <PaginationLink
                            onClick={() => setCurrentPage(page as number)}
                            isActive={currentPage === page}
                            className={cn(
                              "border-dashed hover:border-solid h-7 min-w-7 text-xs",
                              currentPage === page && "border-solid",
                            )}
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ));
                  })()}
                  <PaginationItem className="hidden sm:inline-block">
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(
                            Math.ceil(history.length / itemsPerPage),
                            prev + 1,
                          ),
                        )
                      }
                      className={cn(
                        "border border-dashed hover:border-solid h-7 min-w-7 px-2 text-xs",
                        currentPage ===
                          Math.ceil(history.length / itemsPerPage) &&
                          "pointer-events-none opacity-50",
                      )}
                    />
                  </PaginationItem>
                  <div className="flex sm:hidden items-center gap-2 text-xs text-muted-foreground ml-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon-xs"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="h-6 w-6 border-dashed hover:border-solid"
                      >
                        <RiArrowLeftSLine className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-xs"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(
                              Math.ceil(history.length / itemsPerPage),
                              prev + 1,
                            ),
                          )
                        }
                        disabled={
                          currentPage ===
                          Math.ceil(history.length / itemsPerPage)
                        }
                        className="h-6 w-6 border-dashed hover:border-solid"
                      >
                        <RiArrowRightSLine className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </PaginationContent>
              </Pagination>
            )}
          </>
        ) : (
          <div className="w-full mt-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-muted/20 grid place-items-center mb-4 border-2 border-dashed">
              <RiHistoryLine className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium tracking-wide mb-2">
              No History Yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-[300px] leading-relaxed">
              Your search history will appear here. Start by searching for a
              domain, IP, or ASN above.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground border border-dashed rounded-full px-3 py-1.5">
              <RiInformationLine className="w-3.5 h-3.5" />
              <span>History is stored locally in your browser</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
