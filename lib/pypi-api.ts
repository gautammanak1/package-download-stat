export interface PyPIDownloadPoint {
  data: Array<{
    date: string;
    downloads: number;
  }>;
  package: string;
}

export interface PyPIExtendedStats {
  totalDownloads?: number;
  totalDownloadsThisYear?: number;
  monthlyDownloads?: Array<{ month: number; downloads: number }>;
  topDates?: Array<{ date: string; downloads: number }>;
  topCountries?: Array<{ country: string; downloads: number }>;
  topCountriesToday?: Array<{ country: string; downloads: number }>;
  topDatesThisMonth?: Array<{ date: string; downloads: number }>;
  customRangeTopDates?: Array<{ date: string; downloads: number }>;
  singleDateStats?: Array<{ date: string; downloads: number }>;
}

export interface PyPIPackageInfo {
  info: {
    name: string;
    version: string;
    summary?: string;
    description?: string;
    author?: string;
    author_email?: string;
    maintainer?: string;
    maintainer_email?: string;
    home_page?: string;
    project_url?: string;
    project_urls?: Record<string, string>;
    requires_python?: string;
    license?: string;
  };
  releases: Record<string, any[]>;
  urls: any[];
}

export async function getPyPIDownloads(
  packageName: string,
  period: "day" | "week" | "month"
): Promise<PyPIDownloadPoint> {
  const normalizedName = packageName.toLowerCase();
  
  // Try our Next.js API route first (uses BigQuery if available, falls back to pypistats.org)
  try {
    const apiUrl = `/api/pypi-stats?package=${encodeURIComponent(normalizedName)}&period=${period}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for BigQuery
    
    const response = await fetch(apiUrl, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        return {
          data: result.data,
          package: packageName,
        };
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.bigqueryInfo) {
        // BigQuery info available in error response
        throw new Error(
          `Download statistics not available for "${packageName}". ` +
          `Use Google BigQuery with dataset: bigquery-public-data.pypi.file_downloads`
        );
      }
    }
  } catch (error: any) {
    // If timeout or network error, try direct pypistats.org as fallback
    if (error.name === 'AbortError' || error.message.includes('fetch')) {
      // Try direct pypistats.org API as last resort
      try {
        const url = `https://pypistats.org/api/packages/${normalizedName}/recent?period=${period}`;
        const fallbackController = new AbortController();
        const fallbackTimeout = setTimeout(() => fallbackController.abort(), 10000);
        
        const response = await fetch(url, {
          signal: fallbackController.signal,
        });
        
        clearTimeout(fallbackTimeout);
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.data && data.data.length > 0) {
            return {
              data: data.data,
              package: packageName,
            };
          }
        }
      } catch (fallbackError) {
        // Continue to throw original error
      }
    }
    
    // Re-throw with informative message
    throw new Error(
      error.message || 
      `Download statistics not available for "${packageName}" via public APIs. ` +
      `PyPI does not provide download statistics for all packages. ` +
      `For official download statistics, use Google BigQuery: ` +
      `bigquery-public-data.pypi.file_downloads`
    );
  }
  
  // If we get here, no data was found
  throw new Error(
    `Download statistics not available for "${packageName}". ` +
    `Use Google BigQuery with dataset: bigquery-public-data.pypi.file_downloads`
  );
}

export async function getPyPIOverallDownloads(
  packageName: string
): Promise<{ total: number; period: string } | null> {
  try {
    // Use server-side API route to avoid CORS issues
    const response = await fetch(`/api/pypi-stats?package=${encodeURIComponent(packageName.toLowerCase())}&overall=true`);
    
    if (!response.ok) {
      return null;
    }
    
    const result = await response.json();
    return result.overall || null;
  } catch (error) {
    return null;
  }
}

export async function getPyPIPackageInfo(packageName: string): Promise<PyPIPackageInfo> {
  const url = `https://pypi.org/pypi/${packageName.toLowerCase()}/json`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Package ${packageName} not found on PyPI`);
  }
  
  return response.json();
}

export async function getPyPIExtendedStats(
  packageName: string,
  queryType: string = "all",
  fromDate?: string,
  toDate?: string
): Promise<PyPIExtendedStats> {
  const params = new URLSearchParams({
    package: packageName.toLowerCase(),
    type: queryType,
  });
  
  if (fromDate) params.append("from", fromDate);
  if (toDate) params.append("to", toDate);
  
  const response = await fetch(`/api/pypi-stats-extended?${params.toString()}`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to fetch extended PyPI statistics");
  }
  
  const result = await response.json();
  return result.data || {};
}

