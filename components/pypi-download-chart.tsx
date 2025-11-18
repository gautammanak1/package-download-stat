"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { format, parseISO } from "date-fns";
import { PyPIDownloadPoint } from "@/lib/pypi-api";
import { motion } from "framer-motion";

interface PyPIDownloadChartProps {
  data: PyPIDownloadPoint;
  type: "day" | "week" | "month";
}

export function PyPIDownloadChart({ data, type }: PyPIDownloadChartProps) {
  const chartData = useMemo(() => {
    if (!data.data || data.data.length === 0) {
      return [];
    }

    return data.data.map((item) => ({
      date: format(parseISO(item.date), type === "day" ? "MMM dd" : type === "week" ? "MMM dd" : "MMM yyyy"),
      downloads: item.downloads,
    }));
  }, [data, type]);

  const totalDownloads = useMemo(() => {
    return data.data?.reduce((sum, item) => sum + item.downloads, 0) || 0;
  }, [data]);

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
      <div className="mb-4 text-center">
        <p className="text-sm text-muted-foreground">
          Total downloads: <span className="font-semibold text-foreground">{totalDownloads.toLocaleString()}</span>
        </p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            className="text-xs"
            tick={{ fill: "currentColor" }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: "currentColor" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Line
            type="monotone"
            dataKey="downloads"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

