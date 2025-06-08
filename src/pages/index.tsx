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
  RiSparklingLine,
  RiGlobalLine,
} from "@remixicon/react";
import React, { useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { cn, toSearchURI } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
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
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [trashMode, setTrashMode] = React.useState<boolean>(false);
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [selectedType, setSelectedType] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [mounted, setMounted] = React.useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState<number>(0);
  const itemsPerPage = 5;

  useEffect(() => {
    setMounted(true);
  }, []);

  const processedHistory = useMemo(() => {
    if (!mounted) return [];

    const items = searchTerm ? searchHistory(searchTerm) : listHistory();
    const filtered =
      selectedType === "all"
        ? items
        : items.filter((item) => item.queryType === selectedType);

    return [...filtered].sort((a, b) => {
      return sortOrder === "desc"
        ? b.timestamp - a.timestamp
        : a.timestamp - b.timestamp;
    });
  }, [mounted, searchTerm, sortOrder, selectedType, refreshTrigger]);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(processedHistory.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = processedHistory.slice(startIndex, endIndex);

    return {
      totalPages,
      currentItems,
      hasItems: processedHistory.length > 0,
      hasPagination: processedHistory.length > itemsPerPage,
    };
  }, [processedHistory, currentPage, itemsPerPage]);

  const handleSearch = useCallback((query: string) => {
    setLoading(true);
    window.location.href = toSearchURI(query);
  }, []);

  const getTypeColor = useCallback((type: string) => {
    const colorMap = {
      domain: "text-blue-500",
      ipv4: "text-green-500",
      ipv6: "text-purple-500",
      asn: "text-orange-500",
      cidr: "text-pink-500",
    } as const;
    return colorMap[type as keyof typeof colorMap] || "text-gray-500";
  }, []);

  const handleRemoveHistory = useCallback(
    (query: string) => {
      if (!mounted) return;

      removeHistory(query);
      setRefreshTrigger((prev) => prev + 1);

      setTimeout(() => {
        const newHistory = listHistory();
        const newTotalPages = Math.ceil(newHistory.length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(1);
        }
      }, 0);
    },
    [mounted, currentPage, itemsPerPage],
  );

  useEffect(() => {
    if (
      currentPage > paginationData.totalPages &&
      paginationData.totalPages > 0
    ) {
      setCurrentPage(1);
    }
  }, [paginationData.totalPages, currentPage]);

  return (
    <main className={"w-full h-full grid place-items-center p-4 md:p-6"}>
      <div className={"flex flex-col items-center w-full h-fit max-w-[568px]"}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-6"
        >
          <h1 className="text-lg md:text-xl lg:text-2xl font-thin select-none mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            {t("title")}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={"w-full"}
        >
          <SearchBox onSearch={handleSearch} loading={loading} autoFocus />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full flex flex-row items-center justify-between mt-8 mb-4"
        >
          <div className="flex flex-row items-center gap-3">
            <div className="relative group">
              <Input
                className="w-24 sm:w-48 lg:w-64 h-8 text-xs pl-8 border-dashed focus:border-solid transition-all duration-300 group-hover:border-solid"
                placeholder={t("search_history")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground transition-colors duration-300 group-hover:text-foreground" />
            </div>
          </div>

          <div className="flex flex-row gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="relative border-dashed hover:border-solid transition-all duration-300"
                >
                  <RiFilterLine className="h-3.5 w-3.5" />
                  {selectedType !== "all" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"
                    />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  {t("filter_by_type")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1.5" />
                <DropdownMenuRadioGroup
                  value={selectedType}
                  onValueChange={setSelectedType}
                >
                  <DropdownMenuRadioItem value="all" className="text-xs">
                    {t("all_types")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="domain" className="text-xs">
                    {t("domain_only")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ipv4" className="text-xs">
                    {t("ipv4_only")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ipv6" className="text-xs">
                    {t("ipv6_only")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="asn" className="text-xs">
                    {t("asn_only")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="cidr" className="text-xs">
                    {t("cidr_only")}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="relative group border-dashed hover:border-solid transition-all duration-300"
            >
              <motion.div
                key={sortOrder}
                initial={{ rotate: 180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {sortOrder === "asc" ? (
                  <RiSortAsc className="h-3.5 w-3.5" />
                ) : (
                  <RiSortDesc className="h-3.5 w-3.5" />
                )}
              </motion.div>
            </Button>

            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setTrashMode(!trashMode)}
              className={cn(
                "relative group border-dashed hover:border-solid transition-all duration-300",
                trashMode &&
                  "bg-destructive/5 hover:bg-destructive/10 text-destructive border-destructive",
              )}
            >
              <motion.div
                key={trashMode ? "trash" : "normal"}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Icon
                  icon={trashMode ? <RiArrowGoBackLine /> : <RiDeleteBinLine />}
                  className="w-3.5 h-3.5"
                />
              </motion.div>
            </Button>
          </div>
        </motion.div>
        <AnimatePresence mode="wait">
          {paginationData.hasItems ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="w-full"
            >
              <div className="w-full grid grid-cols-1 gap-2.5">
                {paginationData.currentItems.map((item, index) => (
                  <motion.div
                    key={`${item.query}-${item.timestamp}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                      ease: "easeOut",
                    }}
                  >
                    <Clickable tapScale={0.985}>
                      <Card
                        className={cn(
                          "group transition-all duration-300 hover:shadow-md border-dashed hover:border-solid",
                          "bg-secondary/25 hover:bg-secondary/50 backdrop-blur-sm",
                          "hover:scale-[1.01] hover:-translate-y-0.5",
                          trashMode &&
                            "hover:border-destructive hover:bg-destructive/5",
                        )}
                      >
                        <CardContent className="p-3">
                          <Link
                            className="flex flex-row items-center"
                            href={toSearchURI(item.query)}
                            onClick={(e) => {
                              if (trashMode) {
                                e.preventDefault();
                                handleRemoveHistory(item.query);
                                return;
                              } else {
                                handleSearch(item.query);
                              }
                            }}
                          >
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full grid place-items-center border-2 border-dashed shrink-0 transition-all duration-300",
                                trashMode
                                  ? "border-destructive/50 group-hover:border-destructive"
                                  : `border-current/50 group-hover:border-current`,
                                getTypeColor(item.queryType),
                              )}
                            >
                              <motion.div
                                key={trashMode ? "trash" : "link"}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Icon
                                  icon={
                                    !trashMode ? (
                                      <RiLinkM />
                                    ) : (
                                      <RiDeleteBinLine />
                                    )
                                  }
                                  className={cn(
                                    "w-3.5 h-3.5 transition-colors duration-300",
                                    trashMode
                                      ? "text-destructive"
                                      : "text-current",
                                  )}
                                />
                              </motion.div>
                            </div>

                            <div className="ml-3 flex-grow">
                              <div className="flex items-center">
                                <p className="text-sm font-medium tracking-wide truncate">
                                  {item.query}
                                </p>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "ml-2 text-[10px] px-1.5 py-0 font-normal border-dashed transition-all duration-300",
                                    "group-hover:border-solid",
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

                            <motion.div
                              className={cn(
                                "w-6 h-6 rounded-full grid place-items-center ml-2 transition-all duration-300",
                                "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100",
                                "border border-dashed group-hover:border-solid",
                                trashMode
                                  ? "border-destructive/50 group-hover:border-destructive"
                                  : "border-primary/50 group-hover:border-primary",
                              )}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <RiArrowRightSLine
                                className={cn(
                                  "w-3.5 h-3.5 transition-colors duration-300",
                                  trashMode
                                    ? "text-destructive"
                                    : "text-primary",
                                )}
                              />
                            </motion.div>
                          </Link>
                        </CardContent>
                      </Card>
                    </Clickable>
                  </motion.div>
                ))}
              </div>
              {paginationData.hasPagination && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="mt-4"
                >
                  <Pagination className="justify-end">
                    <PaginationContent className="gap-1">
                      <PaginationItem className="hidden sm:inline-block">
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          className={cn(
                            "border border-dashed hover:border-solid h-7 min-w-7 px-2 text-xs transition-all duration-300",
                            currentPage === 1 &&
                              "pointer-events-none opacity-50",
                          )}
                        />
                      </PaginationItem>

                      {(() => {
                        const { totalPages } = paginationData;
                        const maxVisiblePages =
                          typeof window !== "undefined" &&
                          window.innerWidth < 640
                            ? 3
                            : 5;
                        const pages = [];

                        if (totalPages <= maxVisiblePages) {
                          for (let i = 1; i <= totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
                          if (currentPage <= 3) {
                            for (let i = 1; i <= 3; i++) pages.push(i);
                            pages.push("ellipsis");
                            pages.push(totalPages);
                          } else if (currentPage >= totalPages - 2) {
                            pages.push(1);
                            pages.push("ellipsis");
                            for (let i = totalPages - 2; i <= totalPages; i++)
                              pages.push(i);
                          } else {
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
                                  "border-dashed hover:border-solid h-7 min-w-7 text-xs transition-all duration-300",
                                  currentPage === page &&
                                    "border-solid bg-primary/10",
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
                              Math.min(paginationData.totalPages, prev + 1),
                            )
                          }
                          className={cn(
                            "border border-dashed hover:border-solid h-7 min-w-7 px-2 text-xs transition-all duration-300",
                            currentPage === paginationData.totalPages &&
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
                            className="h-6 w-6 border-dashed hover:border-solid transition-all duration-300"
                          >
                            <RiArrowLeftSLine className="h-3 w-3" />
                          </Button>
                          <span className="px-2 text-xs">
                            {currentPage} / {paginationData.totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="icon-xs"
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(paginationData.totalPages, prev + 1),
                              )
                            }
                            disabled={currentPage === paginationData.totalPages}
                            className="h-6 w-6 border-dashed hover:border-solid transition-all duration-300"
                          >
                            <RiArrowRightSLine className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </PaginationContent>
                  </Pagination>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full mt-12 flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="w-20 h-20 backdrop-blur-sm rounded-full bg-gradient-to-br from-muted/30 to-muted/10 grid place-items-center mb-6 border-2 border-dashed border-muted/50"
              >
                <RiHistoryLine className="w-10 h-10 text-muted-foreground" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <h3 className="text-lg font-medium tracking-wide mb-3 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  {t("no_history_title")}
                </h3>
                <p className="text-sm text-muted-foreground max-w-[320px] leading-relaxed mb-6">
                  {t("no_history_description")}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.9 }}
                className="flex items-center gap-2 text-xs text-muted-foreground border border-dashed rounded-full px-4 py-2 bg-secondary/25 backdrop-blur-sm hover:bg-secondary/40 transition-all duration-300"
              >
                <RiInformationLine className="w-3.5 h-3.5" />
                <span>{t("local_storage_info")}</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
