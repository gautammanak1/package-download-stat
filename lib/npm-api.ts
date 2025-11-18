import { format } from "date-fns";

export interface DownloadPoint {
  downloads: number;
  start: string;
  end: string;
  package: string;
}

export interface DownloadRange {
  downloads: Array<{
    downloads: number;
    day: string;
  }>;
  start: string;
  end: string;
  package: string;
}

export async function getPackageDownloads(
  packageName: string,
  from: string,
  to: string
): Promise<DownloadRange> {
  // Validate dates - ensure they're not in the future and from is before to
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  // Clamp dates to today if they're in the future
  const validFrom = fromDate > today ? format(today, "yyyy-MM-dd") : from;
  const validTo = toDate > today ? format(today, "yyyy-MM-dd") : to;

  // Ensure from is before to
  if (new Date(validFrom) > new Date(validTo)) {
    throw new Error("Start date must be before end date");
  }

  const url = `https://api.npmjs.org/downloads/range/${validFrom}:${validTo}/${packageName}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        `Package "${packageName}" not found on npm or download statistics not available`
      );
    }
    throw new Error(`Failed to fetch downloads for ${packageName}. Status: ${response.status}`);
  }

  return response.json();
}

export async function getPackageDownloadsPoint(
  packageName: string,
  period: "last-day" | "last-week" | "last-month" | "last-year"
): Promise<DownloadPoint> {
  const url = `https://api.npmjs.org/downloads/point/${period}/${packageName}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch downloads for ${packageName}`);
  }

  return response.json();
}

export async function getPackageInfo(packageName: string) {
  const url = `https://registry.npmjs.org/${packageName}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Package ${packageName} not found`);
  }

  return response.json();
}
