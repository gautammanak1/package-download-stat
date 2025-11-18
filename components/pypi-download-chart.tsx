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
} from "recharts";
import { format, parseISO } from "date-fns";
import { PyPIDownloadPoint } from "@/lib/pypi-api";
import { motion } from "framer-motion";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartStyle, type ChartConfig } from "@/components/ui/chart";

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
      <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
        <BarChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return format(date, type === "day" ? "MMM dd" : type === "week" ? "MMM dd" : "MMM yyyy");
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
            width={60}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="w-[150px]"
                nameKey="downloads"
                labelFormatter={(value) => {
                  return format(new Date(value), "MMM dd, yyyy");
                }}
              />
            }
          />
          <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </motion.div>
  );
}

