"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import type { PyPIExtendedStats } from "@/lib/pypi-api";
import { Globe, TrendingUp, Calendar, MapPin } from "lucide-react";

interface PyPIExtendedStatsProps {
  stats: PyPIExtendedStats;
  packageName: string;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Different colors for each country
const COUNTRY_COLORS = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#10b981", // Green
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#84cc16", // Lime
  "#6366f1", // Indigo
  "#14b8a6", // Teal
  "#a855f7", // Violet
];

export function PyPIExtendedStats({ stats, packageName }: PyPIExtendedStatsProps) {
  const monthlyChartData = useMemo(() => {
    if (!stats.monthlyDownloads || stats.monthlyDownloads.length === 0) return [];
    return stats.monthlyDownloads.map((item) => ({
      month: MONTH_NAMES[item.month - 1] || `Month ${item.month}`,
      downloads: item.downloads,
    }));
  }, [stats.monthlyDownloads]);

  const topDatesChartData = useMemo(() => {
    if (!stats.topDates || stats.topDates.length === 0) return [];
    return stats.topDates.map((item) => ({
      date: format(parseISO(item.date), "MMM dd"),
      downloads: item.downloads,
    }));
  }, [stats.topDates]);

  const topDatesThisMonthChartData = useMemo(() => {
    if (!stats.topDatesThisMonth || stats.topDatesThisMonth.length === 0) return [];
    return stats.topDatesThisMonth.map((item) => ({
      date: format(parseISO(item.date), "MMM dd"),
      downloads: item.downloads,
    }));
  }, [stats.topDatesThisMonth]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.totalDownloads !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Total Downloads (All Time)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  {(stats.totalDownloads || 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Since package launch
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {stats.totalDownloadsThisYear !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="h-5 w-5 text-primary" />
                  Total Downloads This Year
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  {(stats.totalDownloadsThisYear || 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {new Date().getFullYear()}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Monthly Downloads Chart */}
      {monthlyChartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Monthly Downloads This Year</CardTitle>
              <CardDescription>Download trends by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="min-h-[250px]">
                <BarChart data={monthlyChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tick={{ fill: "currentColor", fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "currentColor", fontSize: 12 }}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                    cursor={{ fill: "hsl(var(--primary))", opacity: 0.1 }}
                  />
                  <Bar
                    dataKey="downloads"
                    radius={[6, 6, 0, 0]}
                  >
                    {monthlyChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COUNTRY_COLORS[index % COUNTRY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Top 10 Dates This Year */}
      {topDatesChartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Top 10 Dates by Downloads (This Year)</CardTitle>
              <CardDescription>Highest download days in {new Date().getFullYear()}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="min-h-[250px]">
                <BarChart data={topDatesChartData} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" />
                  <XAxis
                    type="number"
                    className="text-xs"
                    tick={{ fill: "currentColor", fontSize: 12 }}
                    width={60}
                  />
                  <YAxis
                    dataKey="date"
                    type="category"
                    className="text-xs"
                    tick={{ fill: "currentColor", fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                    cursor={{ fill: "hsl(var(--primary))", opacity: 0.1 }}
                  />
                  <Bar
                    dataKey="downloads"
                    fill="hsl(var(--primary))"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Top 10 Dates This Month */}
      {topDatesThisMonthChartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Top 10 Dates This Month</CardTitle>
              <CardDescription>Highest download days in current month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="min-h-[250px]">
                <BarChart data={topDatesThisMonthChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: "currentColor", fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "currentColor", fontSize: 12 }}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                    cursor={{ fill: "hsl(var(--primary))", opacity: 0.1 }}
                  />
                  <Bar
                    dataKey="downloads"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Top Countries Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.topCountries && stats.topCountries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Globe className="h-5 w-5 text-primary" />
                  Top 10 Countries This Year
                </CardTitle>
                <CardDescription>Downloads by country in {new Date().getFullYear()}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300} className="min-h-[250px]">
                  <PieChart>
                    <Pie
                      data={stats.topCountries}
                      dataKey="downloads"
                      nameKey="country"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ country, downloads }) => `${country}: ${downloads.toLocaleString()}`}
                    >
                      {stats.topCountries.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COUNTRY_COLORS[index % COUNTRY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {stats.topCountries.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {item.country}
                      </span>
                      <span className="font-semibold">{item.downloads.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {stats.topCountriesToday && stats.topCountriesToday.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Globe className="h-5 w-5 text-primary" />
                  Top 10 Countries Today
                </CardTitle>
                <CardDescription>Downloads by country today</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300} className="min-h-[250px]">
                  <BarChart data={stats.topCountriesToday} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" />
                    <XAxis
                      type="number"
                      className="text-xs"
                      tick={{ fill: "currentColor", fontSize: 12 }}
                      width={60}
                    />
                    <YAxis
                      dataKey="country"
                      type="category"
                      className="text-xs"
                      tick={{ fill: "currentColor", fontSize: 12 }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                      cursor={{ fill: "hsl(var(--primary))", opacity: 0.1 }}
                    />
                    <Bar
                      dataKey="downloads"
                      radius={[0, 6, 6, 0]}
                    >
                      {stats.topCountriesToday.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COUNTRY_COLORS[index % COUNTRY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Custom Date Range Results */}
      {stats.customRangeTopDates && stats.customRangeTopDates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Top 10 Dates (Custom Range)</CardTitle>
              <CardDescription>Highest download days in selected date range</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="min-h-[250px]">
                <BarChart 
                  data={stats.customRangeTopDates.map((item) => ({
                    date: format(parseISO(item.date), "MMM dd, yyyy"),
                    downloads: item.downloads,
                  }))}
                  margin={{ top: 5, right: 10, left: 0, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: "currentColor", fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "currentColor", fontSize: 12 }}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                    cursor={{ fill: "hsl(var(--primary))", opacity: 0.1 }}
                  />
                  <Bar
                    dataKey="downloads"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

