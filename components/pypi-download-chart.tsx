"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { format, parseISO } from "date-fns";
import { PyPIDownloadPoint } from "@/lib/pypi-api";
import { motion } from "framer-motion";
import { ChartContainer, ChartStyle, type ChartConfig } from "@/components/ui/chart";

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

interface PyPIDownloadChartProps {
  data: PyPIDownloadPoint;
  type: "day" | "week" | "month";
}

export function PyPIDownloadChart({ data, type }: PyPIDownloadChartProps) {
  const [activeChart, setActiveChart] = useState<"downloads">("downloads");

  const chartData = useMemo(() => {
    if (!data.data || data.data.length === 0) {
      return [];
    }

    return data.data.map((item) => ({
      date: item.date,
      downloads: item.downloads,
    }));
  }, [data, type]);

  const totalDownloads = useMemo(() => {
    return data.data?.reduce((sum, item) => sum + item.downloads, 0) || 0;
  }, [data]);

  const chartConfig: ChartConfig = {
    downloads: {
      label: "Downloads",
      color: "hsl(var(--chart-1))",
    },
  };

  if (chartData.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="mb-4 flex items-center justify-between border-b pb-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Downloads</p>
          <p className="text-2xl font-bold">{totalDownloads.toLocaleString()}</p>
        </div>
      </div>
      <div data-chart="pypi-downloads">
        <ChartStyle id="pypi-downloads" config={chartConfig} />
        <ResponsiveContainer width="100%" height={400} className="min-h-[300px]">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
              tickFormatter={(value) => {
                const date = new Date(value);
                return format(
                  date,
                  type === "day" ? "MMM dd" : type === "week" ? "MMM dd" : "MMM yyyy"
                );
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                color: "hsl(var(--foreground))",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              labelFormatter={(value) => {
                return format(new Date(value), "MMM dd, yyyy");
              }}
            />
            <Bar dataKey={activeChart} radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COUNTRY_COLORS[index % COUNTRY_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
