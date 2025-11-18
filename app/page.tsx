"use client";

import { useState } from "react";
import { Search, Package, Download, Calendar, Code } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { DownloadChart } from "@/components/download-chart";
import { PyPIDownloadChart } from "@/components/pypi-download-chart";
import { PyPIExtendedStats } from "@/components/pypi-extended-stats";
import { AuthorInfo } from "@/components/author-info";
import { ReadmeViewer } from "@/components/readme-viewer";
import { CelebrationAnimation } from "@/components/celebration-animation";
import { getPackageDownloads, getPackageInfo, type DownloadRange } from "@/lib/npm-api";
import {
  getPyPIDownloads,
  getPyPIPackageInfo,
  getPyPIOverallDownloads,
  getPyPIExtendedStats,
  type PyPIDownloadPoint,
  type PyPIExtendedStats as PyPIExtendedStatsType,
} from "@/lib/pypi-api";
import { format, subDays, subWeeks, subMonths, subYears } from "date-fns";

type PackageManager = "npm" | "pypi";

export default function Home() {
  const [packageManager, setPackageManager] = useState<PackageManager>("npm");
  const [packageName, setPackageName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packageInfo, setPackageInfo] = useState<any>(null);
  const [downloadData, setDownloadData] = useState<DownloadRange | null>(null);
  const [pypiDownloadData, setPypiDownloadData] = useState<PyPIDownloadPoint | null>(null);
  const [pypiOverallDownloads, setPypiOverallDownloads] = useState<{
    total: number;
    period: string;
  } | null>(null);
  const [pypiExtendedStats, setPypiExtendedStats] = useState<PyPIExtendedStatsType | null>(null);
  const [loadingExtendedStats, setLoadingExtendedStats] = useState(false);
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [singleDate, setSingleDate] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [activeTab, setActiveTab] = useState("day");
  const [pypiPeriod, setPypiPeriod] = useState<"day" | "week" | "month">("month");
  const [showCelebration, setShowCelebration] = useState(false);
  const [downloadIncrease, setDownloadIncrease] = useState(0);
  const [previousDownloads, setPreviousDownloads] = useState<number | null>(null);
  const [yesterdayDownloads, setYesterdayDownloads] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a package name");
      return;
    }

    setLoading(true);
    setError(null);
    setPackageName(searchQuery.trim());
    setShowCelebration(false); // Reset celebration on new search

    try {
      if (packageManager === "npm") {
        // Get npm package info
        const info = await getPackageInfo(searchQuery.trim());

        // Extract readme from latest version if not at root
        if (!info.readme && info["dist-tags"]?.latest) {
          const latestVersion = info.versions?.[info["dist-tags"].latest];
          if (latestVersion?.readme) {
            info.readme = latestVersion.readme;
          }
        }

        setPackageInfo(info);

        // Set default date range (last 30 days)
        const to = format(new Date(), "yyyy-MM-dd");
        const from = format(subDays(new Date(), 30), "yyyy-MM-dd");
        setDateRange({ from, to });

        // Fetch download data
        const data = await getPackageDownloads(searchQuery.trim(), from, to);
        setDownloadData(data);

        // Get today's and yesterday's downloads for comparison
        const today = format(new Date(), "yyyy-MM-dd");
        const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

        const todayDownloads = data.downloads?.find((item) => item.day === today)?.downloads || 0;
        const yesterdayDownloads =
          data.downloads?.find((item) => item.day === yesterday)?.downloads || 0;

        // Check if today's downloads increased compared to yesterday
        if (yesterdayDownloads > 0 && todayDownloads > yesterdayDownloads) {
          const increase = todayDownloads - yesterdayDownloads;
          setDownloadIncrease(increase);
          setShowCelebration(true);
          // Auto-hide after 4 seconds
          setTimeout(() => setShowCelebration(false), 4000);
        }

        setYesterdayDownloads(yesterdayDownloads);

        // Also track total for other comparisons
        const currentTotal = data.downloads?.reduce((sum, item) => sum + item.downloads, 0) || 0;
        setPreviousDownloads(currentTotal);
        setPypiDownloadData(null);
        setPypiOverallDownloads(null);
      } else {
        // Get PyPI package info
        const info = await getPyPIPackageInfo(searchQuery.trim());
        setPackageInfo(info);

        // Fetch PyPI download data
        // Try to get download stats, but don't fail if overall stats are unavailable
        try {
          const downloadData = await getPyPIDownloads(searchQuery.trim(), pypiPeriod);
          setPypiDownloadData(downloadData);

          // Get today's and yesterday's downloads for comparison
          const today = format(new Date(), "yyyy-MM-dd");
          const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

          const todayDownloads =
            downloadData.data?.find((item) => item.date === today)?.downloads || 0;
          const yesterdayDownloads =
            downloadData.data?.find((item) => item.date === yesterday)?.downloads || 0;

          // Check if today's downloads increased compared to yesterday
          if (yesterdayDownloads > 0 && todayDownloads > yesterdayDownloads) {
            const increase = todayDownloads - yesterdayDownloads;
            setDownloadIncrease(increase);
            setShowCelebration(true);
            // Auto-hide after 4 seconds
            setTimeout(() => setShowCelebration(false), 4000);
          }

          setYesterdayDownloads(yesterdayDownloads);

          // Also track total for other comparisons
          const currentTotal =
            downloadData.data?.reduce((sum, item) => sum + item.downloads, 0) || 0;
          setPreviousDownloads(currentTotal);

          // Try to get overall downloads (optional, may not be available for all packages)
          const overallData = await getPyPIOverallDownloads(searchQuery.trim());
          setPypiOverallDownloads(overallData);
        } catch (downloadError: any) {
          // If download stats fail, still show package info but with error message
          setPypiDownloadData(null);
          setPypiOverallDownloads(null);
          setError(
            downloadError.message ||
              "Download statistics not available for this package. PyPI download stats may not be available for all packages."
          );
        }

        setDownloadData(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch package data");
      setPackageInfo(null);
      setDownloadData(null);
      setPypiDownloadData(null);
      setPypiOverallDownloads(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = async (from: string, to: string) => {
    if (!packageName) return;

    setLoading(true);
    setDateRange({ from, to });

    try {
      const data = await getPackageDownloads(packageName, from, to);
      const currentTotal = data.downloads?.reduce((sum, item) => sum + item.downloads, 0) || 0;

      // Check for increase
      if (previousDownloads !== null && currentTotal > previousDownloads) {
        const increase = currentTotal - previousDownloads;
        setDownloadIncrease(increase);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }

      setPreviousDownloads(currentTotal);
      setDownloadData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch download data");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRange = async (days: number) => {
    const to = format(new Date(), "yyyy-MM-dd");
    const from = format(subDays(new Date(), days), "yyyy-MM-dd");
    setDateRange({ from, to });
    setLoading(true);
    try {
      const data = await getPackageDownloads(packageName, from, to);
      const currentTotal = data.downloads?.reduce((sum, item) => sum + item.downloads, 0) || 0;

      // Check for increase
      if (previousDownloads !== null && currentTotal > previousDownloads) {
        const increase = currentTotal - previousDownloads;
        setDownloadIncrease(increase);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }

      setPreviousDownloads(currentTotal);
      setDownloadData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Celebration Animation */}
      <CelebrationAnimation
        show={showCelebration}
        increase={downloadIncrease}
        message="Your package is growing! 🚀"
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl relative">
        {/* Theme Toggle - Fixed Position */}
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center pt-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            PACKAGE-DOWNLOAD-STAT
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            View npm and PyPI package download statistics with beautiful charts
          </p>

          {/* Package Manager Toggle */}
          <div className="mt-6 flex justify-center gap-2">
            <Button
              variant={packageManager === "npm" ? "default" : "outline"}
              onClick={() => {
                setPackageManager("npm");
                setPackageInfo(null);
                setDownloadData(null);
                setPypiDownloadData(null);
                setSearchQuery("");
              }}
              className="gap-2"
            >
              <Package className="h-4 w-4" />
              npm
            </Button>
            <Button
              variant={packageManager === "pypi" ? "default" : "outline"}
              onClick={() => {
                setPackageManager("pypi");
                setPackageInfo(null);
                setDownloadData(null);
                setPypiDownloadData(null);
                setSearchQuery("");
              }}
              className="gap-2"
            >
              <Code className="h-4 w-4" />
              PyPI
            </Button>
          </div>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-2 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Search Package</CardTitle>
              <CardDescription className="text-base">
                Enter a {packageManager === "npm" ? "npm" : "PyPI"} package name to view its
                download statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={
                      packageManager === "npm"
                        ? "e.g., react, lodash, express"
                        : "e.g., requests, numpy, pandas"
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? "Loading..." : "Search"}
                </Button>
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-sm text-destructive"
                >
                  {error}
                </motion.p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Section */}
        {packageInfo &&
          (downloadData || pypiDownloadData || (packageManager === "pypi" && packageInfo)) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Package Info */}
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-[250px]">
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        {packageManager === "npm" ? (
                          <img
                            src="/logos/npm-icon.png"
                            alt="npm"
                            className="h-8 w-8 object-contain logo-image"
                          />
                        ) : (
                          <img
                            src="/logos/pypi-logo.png"
                            alt="PyPI"
                            className="h-8 w-8 object-contain logo-image"
                          />
                        )}
                        {packageManager === "npm" ? packageInfo.name : packageInfo.info?.name}
                      </CardTitle>
                      <CardDescription className="mt-2 text-base">
                        {packageManager === "npm"
                          ? packageInfo.description || "No description available"
                          : packageInfo.info?.summary ||
                            packageInfo.info?.description ||
                            "No description available"}
                      </CardDescription>
                    </div>
                    <div className="text-right bg-muted/50 px-4 py-3 rounded-lg border">
                      <p className="text-sm text-muted-foreground font-medium">Latest Version</p>
                      <p className="text-2xl font-bold text-primary">
                        {packageManager === "npm"
                          ? packageInfo["dist-tags"]?.latest || "N/A"
                          : packageInfo.info?.version || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {packageManager === "pypi" &&
                          pypiExtendedStats?.totalDownloads !== undefined
                            ? "Total Downloads (All Time)"
                            : "Total Downloads"}
                        </p>
                        <p className="text-lg font-semibold">
                          {packageManager === "npm"
                            ? (
                                downloadData?.downloads?.reduce(
                                  (sum, item) => sum + item.downloads,
                                  0
                                ) || 0
                              ).toLocaleString()
                            : pypiExtendedStats?.totalDownloads !== undefined
                              ? (pypiExtendedStats.totalDownloads || 0).toLocaleString()
                              : (pypiOverallDownloads?.total || 0).toLocaleString() ||
                                (
                                  pypiDownloadData?.data?.reduce(
                                    (sum, item) => sum + item.downloads,
                                    0
                                  ) || 0
                                ).toLocaleString() ||
                                "N/A"}
                        </p>
                      </div>
                    </div>
                    {packageManager === "npm" && downloadData && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date Range</p>
                          <p className="text-lg font-semibold">
                            {format(new Date(downloadData.start), "MMM dd, yyyy")} -{" "}
                            {format(new Date(downloadData.end), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                    )}
                    {packageManager === "pypi" && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Period</p>
                          <p className="text-lg font-semibold capitalize">
                            {pypiOverallDownloads?.period || pypiPeriod}
                          </p>
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Package</p>
                      <a
                        href={
                          packageManager === "npm"
                            ? `https://www.npmjs.com/package/${packageInfo.name}`
                            : `https://pypi.org/project/${packageInfo.info?.name}/`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-semibold text-primary hover:underline"
                      >
                        View on {packageManager === "npm" ? "npm" : "PyPI"}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Date Range Selector - npm only */}
              {packageManager === "npm" && downloadData && (
                <>
                  <Card className="border-2 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-2xl">Date Range</CardTitle>
                      <CardDescription className="text-base">
                        Select a time period to view downloads
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleQuickRange(7)}>
                          Last 7 days
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickRange(30)}>
                          Last 30 days
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickRange(90)}>
                          Last 90 days
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickRange(365)}>
                          Last year
                        </Button>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Input
                          type="date"
                          value={dateRange.from}
                          onChange={(e) => handleDateRangeChange(e.target.value, dateRange.to)}
                          className="max-w-[200px]"
                        />
                        <Input
                          type="date"
                          value={dateRange.to}
                          onChange={(e) => handleDateRangeChange(dateRange.from, e.target.value)}
                          className="max-w-[200px]"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Charts - npm */}
                  <Card className="border-2 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-2xl">Download Statistics</CardTitle>
                      <CardDescription className="text-base">
                        Visualize download trends over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-4">
                          <TabsTrigger value="day">Day</TabsTrigger>
                          <TabsTrigger value="week">Week</TabsTrigger>
                          <TabsTrigger value="month">Month</TabsTrigger>
                          <TabsTrigger value="year">Year</TabsTrigger>
                        </TabsList>
                        <TabsContent value="day">
                          <DownloadChart data={downloadData} type="day" />
                        </TabsContent>
                        <TabsContent value="week">
                          <DownloadChart data={downloadData} type="week" />
                        </TabsContent>
                        <TabsContent value="month">
                          <DownloadChart data={downloadData} type="month" />
                        </TabsContent>
                        <TabsContent value="year">
                          <DownloadChart data={downloadData} type="year" />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* PyPI Period Selector and Charts */}
              {packageManager === "pypi" && (
                <>
                  {pypiDownloadData ? (
                    <Card className="border-2 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-2xl">Download Statistics</CardTitle>
                        <CardDescription className="text-base">
                          Visualize download trends over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4 flex gap-2">
                          <Button
                            variant={pypiPeriod === "day" ? "default" : "outline"}
                            size="sm"
                            onClick={async () => {
                              setPypiPeriod("day");
                              if (packageName) {
                                setLoading(true);
                                try {
                                  const data = await getPyPIDownloads(packageName, "day");
                                  const currentTotal =
                                    data.data?.reduce((sum, item) => sum + item.downloads, 0) || 0;

                                  // Check for increase
                                  if (
                                    previousDownloads !== null &&
                                    currentTotal > previousDownloads
                                  ) {
                                    const increase = currentTotal - previousDownloads;
                                    setDownloadIncrease(increase);
                                    setShowCelebration(true);
                                    setTimeout(() => setShowCelebration(false), 3000);
                                  }

                                  setPreviousDownloads(currentTotal);
                                  setPypiDownloadData(data);
                                  setError(null);
                                } catch (err: any) {
                                  setError(err.message);
                                } finally {
                                  setLoading(false);
                                }
                              }
                            }}
                          >
                            Day
                          </Button>
                          <Button
                            variant={pypiPeriod === "week" ? "default" : "outline"}
                            size="sm"
                            onClick={async () => {
                              setPypiPeriod("week");
                              if (packageName) {
                                setLoading(true);
                                try {
                                  const data = await getPyPIDownloads(packageName, "week");
                                  const currentTotal =
                                    data.data?.reduce((sum, item) => sum + item.downloads, 0) || 0;

                                  // Check for increase
                                  if (
                                    previousDownloads !== null &&
                                    currentTotal > previousDownloads
                                  ) {
                                    const increase = currentTotal - previousDownloads;
                                    setDownloadIncrease(increase);
                                    setShowCelebration(true);
                                    setTimeout(() => setShowCelebration(false), 3000);
                                  }

                                  setPreviousDownloads(currentTotal);
                                  setPypiDownloadData(data);
                                  setError(null);
                                } catch (err: any) {
                                  setError(err.message);
                                } finally {
                                  setLoading(false);
                                }
                              }
                            }}
                          >
                            Week
                          </Button>
                          <Button
                            variant={pypiPeriod === "month" ? "default" : "outline"}
                            size="sm"
                            onClick={async () => {
                              setPypiPeriod("month");
                              if (packageName) {
                                setLoading(true);
                                try {
                                  const data = await getPyPIDownloads(packageName, "month");
                                  const currentTotal =
                                    data.data?.reduce((sum, item) => sum + item.downloads, 0) || 0;

                                  // Check for increase
                                  if (
                                    previousDownloads !== null &&
                                    currentTotal > previousDownloads
                                  ) {
                                    const increase = currentTotal - previousDownloads;
                                    setDownloadIncrease(increase);
                                    setShowCelebration(true);
                                    setTimeout(() => setShowCelebration(false), 3000);
                                  }

                                  setPreviousDownloads(currentTotal);
                                  setPypiDownloadData(data);
                                  setError(null);
                                } catch (err: any) {
                                  setError(err.message);
                                } finally {
                                  setLoading(false);
                                }
                              }
                            }}
                          >
                            Month
                          </Button>
                        </div>
                        <PyPIDownloadChart data={pypiDownloadData} type={pypiPeriod} />
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-2 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-2xl">Download Statistics</CardTitle>
                        <CardDescription className="text-base">
                          Download statistics not available
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex h-[400px] items-center justify-center text-center">
                          <div>
                            <p className="text-muted-foreground mb-2">
                              Download statistics are not available for this package via public
                              APIs.
                            </p>
                            <p className="text-sm text-muted-foreground">
                              PyPI does not provide download statistics for all packages through
                              public APIs. Some packages may not have download data available.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Official Source:</strong> Use{" "}
                              <a
                                href="https://packaging.python.org/en/latest/guides/analyzing-pypi-package-downloads/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-semibold"
                              >
                                Google BigQuery
                              </a>{" "}
                              with the public dataset:{" "}
                              <code className="bg-muted px-1 py-0.5 rounded text-xs">
                                bigquery-public-data.pypi.file_downloads
                              </code>
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Alternative:</strong> Check{" "}
                              <a
                                href={(() => {
                                  // Validate package name to prevent XSS - only allow valid PyPI package names
                                  const pkg = packageInfo?.info?.name || packageName;
                                  if (typeof pkg !== "string") return "#";
                                  // PyPI package names: letters, numbers, underscores, hyphens, dots
                                  const isValid = /^[A-Za-z0-9_.-]+$/.test(pkg);
                                  return isValid
                                    ? `https://pypistats.org/packages/${encodeURIComponent(pkg)}`
                                    : "#";
                                })()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                pypistats.org
                              </a>{" "}
                              for community-maintained statistics.
                            </p>
                            <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                              <p className="text-xs font-semibold mb-1">BigQuery Example Query:</p>
                              <code className="text-xs block whitespace-pre-wrap break-all">
                                {`SELECT COUNT(*) AS num_downloads
FROM \`bigquery-public-data.pypi.file_downloads\`
WHERE file.project = '${packageInfo?.info?.name || packageName}'
  AND DATE(timestamp) BETWEEN 
    DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) 
    AND CURRENT_DATE()`}
                              </code>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* Extended Statistics */}
              {packageManager === "pypi" && packageInfo && (
                <Card className="border-2 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl">Extended Statistics</CardTitle>
                    <CardDescription>
                      View comprehensive download statistics using BigQuery
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Custom Date Range */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Custom Date Range</label>
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          placeholder="From Date"
                          value={customDateFrom}
                          onChange={(e) => setCustomDateFrom(e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          type="date"
                          placeholder="To Date"
                          value={customDateTo}
                          onChange={(e) => setCustomDateTo(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={async () => {
                            if (!packageName || !customDateFrom || !customDateTo) {
                              setError("Please select both from and to dates");
                              return;
                            }
                            setLoadingExtendedStats(true);
                            try {
                              const extendedStats = await getPyPIExtendedStats(
                                packageName,
                                "customRange",
                                customDateFrom,
                                customDateTo
                              );
                              setPypiExtendedStats(extendedStats);
                              setError(null);
                            } catch (err: any) {
                              setError(err.message);
                              setPypiExtendedStats(null);
                            } finally {
                              setLoadingExtendedStats(false);
                            }
                          }}
                          disabled={loadingExtendedStats || !customDateFrom || !customDateTo}
                          variant="outline"
                        >
                          Query Range
                        </Button>
                      </div>
                    </div>

                    {/* Single Date */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Single Date</label>
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          placeholder="Select Date"
                          value={singleDate}
                          onChange={(e) => setSingleDate(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={async () => {
                            if (!packageName || !singleDate) {
                              setError("Please select a date");
                              return;
                            }
                            setLoadingExtendedStats(true);
                            try {
                              const extendedStats = await getPyPIExtendedStats(
                                packageName,
                                "customRange",
                                singleDate,
                                singleDate
                              );
                              setPypiExtendedStats(extendedStats);
                              setError(null);
                            } catch (err: any) {
                              setError(err.message);
                              setPypiExtendedStats(null);
                            } finally {
                              setLoadingExtendedStats(false);
                            }
                          }}
                          disabled={loadingExtendedStats || !singleDate}
                          variant="outline"
                        >
                          Query Date
                        </Button>
                      </div>
                    </div>

                    {/* Load All Statistics */}
                    <Button
                      onClick={async () => {
                        if (!packageName) return;
                        setLoadingExtendedStats(true);
                        try {
                          const extendedStats = await getPyPIExtendedStats(packageName, "all");
                          setPypiExtendedStats(extendedStats);
                          setError(null);
                        } catch (err: any) {
                          setError(err.message);
                          setPypiExtendedStats(null);
                        } finally {
                          setLoadingExtendedStats(false);
                        }
                      }}
                      disabled={loadingExtendedStats}
                      className="w-full"
                    >
                      {loadingExtendedStats
                        ? "Loading Extended Statistics..."
                        : "Load All Extended Statistics"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Extended Statistics Display */}
              {packageManager === "pypi" && pypiExtendedStats && packageName && (
                <PyPIExtendedStats stats={pypiExtendedStats} packageName={packageName} />
              )}

              {/* Author Information */}
              {packageManager === "npm" && packageInfo?.author && (
                <AuthorInfo author={packageInfo.author} />
              )}
              {packageManager === "pypi" && packageInfo?.info && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border-2 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-2xl">Author Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {packageInfo.info.author && (
                          <div>
                            <p className="text-sm text-muted-foreground">Author</p>
                            <p className="font-semibold">{packageInfo.info.author}</p>
                          </div>
                        )}
                        {packageInfo.info.author_email && (
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <a
                              href={`mailto:${packageInfo.info.author_email}`}
                              className="text-primary hover:underline"
                            >
                              {packageInfo.info.author_email}
                            </a>
                          </div>
                        )}
                        {packageInfo.info.maintainer && (
                          <div>
                            <p className="text-sm text-muted-foreground">Maintainer</p>
                            <p className="font-semibold">{packageInfo.info.maintainer}</p>
                          </div>
                        )}
                        {packageInfo.info.home_page && (
                          <div>
                            <p className="text-sm text-muted-foreground">Homepage</p>
                            <a
                              href={packageInfo.info.home_page}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline break-all"
                            >
                              {packageInfo.info.home_page}
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Maintainers - npm only */}
              {packageManager === "npm" &&
                packageInfo?.maintainers &&
                packageInfo.maintainers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="border-2 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-2xl">Maintainers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {packageInfo.maintainers.map((maintainer: any, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="font-medium">{maintainer.name}</span>
                              {maintainer.email && (
                                <span className="text-sm text-muted-foreground">
                                  ({maintainer.email})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

              {/* README */}
              {packageManager === "npm" && packageInfo?.readme && (
                <ReadmeViewer
                  readme={packageInfo.readme}
                  packageName={packageInfo.name}
                  repositoryUrl={
                    typeof packageInfo.repository === "string"
                      ? packageInfo.repository
                      : packageInfo.repository?.url ||
                        packageInfo.repository?.github ||
                        packageInfo.homepage
                  }
                />
              )}
              {packageManager === "pypi" && packageInfo?.info?.description && (
                <ReadmeViewer
                  readme={packageInfo.info.description}
                  packageName={packageInfo.info.name}
                  repositoryUrl={
                    packageInfo.info.project_urls?.Source || packageInfo.info.home_page
                  }
                />
              )}
            </motion.div>
          )}

        {/* Empty State */}
        {!packageInfo && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-[400px] items-center justify-center"
          >
            <div className="text-center">
              <Package className="mx-auto h-16 w-16 text-muted-foreground" />
              <p className="mt-4 text-lg font-semibold">
                Search for a {packageManager === "npm" ? "npm" : "PyPI"} package
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter a package name above to view its download statistics
              </p>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 mb-8 text-center border-t border-border pt-8"
        >
          <p className="text-sm text-muted-foreground">
            Made by{" "}
            <a
              href="https://gautammanak.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline transition-colors"
            >
              Gautam Manak
            </a>
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
