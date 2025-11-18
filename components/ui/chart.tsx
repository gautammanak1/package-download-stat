"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Chart container component
export interface ChartConfig {
  [key: string]: {
    label?: string;
    color?: string;
  };
}

interface ChartContainerProps {
  id?: string;
  config?: ChartConfig;
  className?: string;
  children: React.ReactNode;
}

export function ChartContainer({ id, config, className, children }: ChartContainerProps) {
  return (
    <div id={id} className={cn("w-full", className)}>
      {children}
    </div>
  );
}

// Chart tooltip component
interface ChartTooltipProps {
  content?: React.ReactNode;
  cursor?: boolean | object;
  children?: React.ReactNode;
}

export function ChartTooltip({ content, cursor, children }: ChartTooltipProps) {
  if (children) {
    return React.cloneElement(children as React.ReactElement, {
      content,
      cursor,
    });
  }
  return null;
}

// Chart tooltip content component
interface ChartTooltipContentProps {
  className?: string;
  hideLabel?: boolean;
  nameKey?: string;
  labelFormatter?: (value: any) => string;
  formatter?: (value: any, name: string) => [string, string];
  children?: React.ReactNode;
}

export function ChartTooltipContent({
  className,
  hideLabel,
  nameKey,
  labelFormatter,
  formatter,
  ...props
}: ChartTooltipContentProps) {
  return null; // This will be handled by Recharts Tooltip component
}

// Chart style component for CSS variables
interface ChartStyleProps {
  id: string;
  config: ChartConfig;
}

export function ChartStyle({ id, config }: ChartStyleProps) {
  const cssVars = React.useMemo(() => {
    const vars: Record<string, string> = {};
    Object.entries(config).forEach(([key, value]) => {
      if (value.color) {
        vars[`--color-${key}`] = value.color;
      }
    });
    return vars;
  }, [config]);

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          [data-chart="${id}"] {
            ${Object.entries(cssVars)
              .map(([key, value]) => `${key}: ${value};`)
              .join("\n")}
          }
        `,
      }}
    />
  );
}
