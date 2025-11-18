export interface PyPIDownloadPoint {
  data: Array<{
    date: string;
    downloads: number;
  }>;
  package: string;
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
  const url = `https://pypistats.org/api/packages/${packageName.toLowerCase()}/recent?period=${period}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch PyPI downloads for ${packageName}`);
  }
  
  const data = await response.json();
  
  return {
    data: data.data || [],
    package: packageName,
  };
}

export async function getPyPIOverallDownloads(
  packageName: string
): Promise<{ total: number; period: string }> {
  const url = `https://pypistats.org/api/packages/${packageName.toLowerCase()}/overall`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch PyPI overall downloads for ${packageName}`);
  }
  
  return response.json();
}

export async function getPyPIPackageInfo(packageName: string): Promise<PyPIPackageInfo> {
  const url = `https://pypi.org/pypi/${packageName.toLowerCase()}/json`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Package ${packageName} not found on PyPI`);
  }
  
  return response.json();
}

