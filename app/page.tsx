"use client";

import { useState } from "react";
import { Search, Package, Download, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { DownloadChart } from "@/components/download-chart";
import { AuthorInfo } from "@/components/author-info";
import { ReadmeViewer } from "@/components/readme-viewer";
import { getPackageDownloads, getPackageInfo, type DownloadRange } from "@/lib/npm-api";
import { format, subDays, subWeeks, subMonths, subYears } from "date-fns";

export default function Home() {
  const [packageName, setPackageName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packageInfo, setPackageInfo] = useState<any>(null);
  const [downloadData, setDownloadData] = useState<DownloadRange | null>(null);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [activeTab, setActiveTab] = useState("day");

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a package name");
      return;
    }

    setLoading(true);
    setError(null);
    setPackageName(searchQuery.trim());

    try {
      // Get package info
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
    } catch (err: any) {
      setError(err.message || "Failed to fetch package data");
      setPackageInfo(null);
      setDownloadData(null);
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
      setDownloadData(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch download data");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRange = (days: number) => {
    const to = format(new Date(), "yyyy-MM-dd");
    const from = format(subDays(new Date(), days), "yyyy-MM-dd");
    handleDateRangeChange(from, to);
  };

  return (
    <div className="min-h-screen bg-background">
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
            NPM-PACKAGE-DOWNLOAD-STAT
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            View npm package download statistics with beautiful charts
          </p>
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
                Enter an npm package name to view its download statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="e.g., react, lodash, express"
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
        {packageInfo && downloadData && (
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
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Package className="h-6 w-6 text-primary" />
                      {packageInfo.name}
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                      {packageInfo.description || "No description available"}
                    </CardDescription>
                  </div>
                  <div className="text-right bg-muted/50 px-4 py-3 rounded-lg border">
                    <p className="text-sm text-muted-foreground font-medium">Latest Version</p>
                    <p className="text-2xl font-bold text-primary">{packageInfo["dist-tags"]?.latest || "N/A"}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Downloads</p>
                      <p className="text-lg font-semibold">
                        {downloadData.downloads?.reduce((sum, item) => sum + item.downloads, 0).toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date Range</p>
                      <p className="text-lg font-semibold">
                        {format(new Date(downloadData.start), "MMM dd, yyyy")} - {format(new Date(downloadData.end), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Package</p>
                    <a
                      href={`https://www.npmjs.com/package/${packageInfo.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-primary hover:underline"
                    >
                      View on npm
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date Range Selector */}
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Date Range</CardTitle>
                <CardDescription className="text-base">Select a time period to view downloads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickRange(7)}
                  >
                    Last 7 days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickRange(30)}
                  >
                    Last 30 days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickRange(90)}
                  >
                    Last 90 days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickRange(365)}
                  >
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

            {/* Charts */}
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Download Statistics</CardTitle>
                <CardDescription className="text-base">Visualize download trends over time</CardDescription>
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

            {/* Author Information */}
            {packageInfo?.author && (
              <AuthorInfo author={packageInfo.author} />
            )}

            {/* Maintainers */}
            {packageInfo?.maintainers && packageInfo.maintainers.length > 0 && (
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
            {packageInfo?.readme && (
              <ReadmeViewer 
                readme={packageInfo.readme} 
                packageName={packageInfo.name}
                repositoryUrl={
                  typeof packageInfo.repository === 'string' 
                    ? packageInfo.repository 
                    : packageInfo.repository?.url || 
                      packageInfo.repository?.github || 
                      packageInfo.homepage
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
              <p className="mt-4 text-lg font-semibold">Search for an npm package</p>
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

