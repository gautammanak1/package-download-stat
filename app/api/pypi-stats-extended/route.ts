import { NextRequest, NextResponse } from "next/server";

/**
 * Extended PyPI Statistics API Route
 * Provides comprehensive download statistics using BigQuery
 */

let bigqueryClient: any = null;

async function getBigQueryClient() {
  if (bigqueryClient) {
    return bigqueryClient;
  }

  try {
    const { BigQuery } = await import('@google-cloud/bigquery');
    const path = await import('path');
    const fs = await import('fs');
    
    let bigqueryOptions: any = {};
    let credentialsPath: string | null = null;
    
    // Priority 1: Check for JSON credentials in environment variable (Vercel)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      try {
        // Parse JSON credentials from environment variable
        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        bigqueryOptions.credentials = credentials;
        // Set project ID from credentials
        if (credentials.project_id) {
          bigqueryOptions.projectId = credentials.project_id;
        }
        console.log('✅ Using BigQuery credentials from GOOGLE_APPLICATION_CREDENTIALS_JSON env var');
        console.log(`✅ Project ID: ${credentials.project_id || 'not found'}`);
      } catch (parseError: any) {
        console.warn('⚠️ Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON:', parseError.message);
      }
    }
    // Priority 2: Check environment variable for file path
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (!path.default.isAbsolute(credentialsPath)) {
        credentialsPath = path.default.join(process.cwd(), credentialsPath);
      }
      if (fs.default.existsSync(credentialsPath)) {
        bigqueryOptions.keyFilename = credentialsPath;
        // Try to read project ID from file
        try {
          const fileContent = fs.default.readFileSync(credentialsPath, 'utf8');
          const creds = JSON.parse(fileContent);
          if (creds.project_id) {
            bigqueryOptions.projectId = creds.project_id;
          }
        } catch (e) {
          // Ignore errors reading project ID
        }
        console.log('✅ Using BigQuery credentials from:', credentialsPath);
      }
    }
    // Priority 3: Check for credentials file in project root (local development)
    else {
      const defaultPath = path.default.join(process.cwd(), 'extreme-battery-463111-f5.json');
      if (fs.default.existsSync(defaultPath)) {
        credentialsPath = defaultPath;
        bigqueryOptions.keyFilename = credentialsPath;
        // Try to read project ID from file
        try {
          const fileContent = fs.default.readFileSync(defaultPath, 'utf8');
          const creds = JSON.parse(fileContent);
          if (creds.project_id) {
            bigqueryOptions.projectId = creds.project_id;
          }
        } catch (e) {
          // Ignore errors reading project ID
        }
        console.log('✅ Using BigQuery credentials from local file:', credentialsPath);
      }
    }
    
    // If no credentials found, try Application Default Credentials
    if (!bigqueryOptions.credentials && !bigqueryOptions.keyFilename) {
      console.log('⚠️ No credentials found, attempting Application Default Credentials');
    }
    
    bigqueryClient = new BigQuery(bigqueryOptions);
    
    // Test connection
    try {
      const [project] = await bigqueryClient.getProjectId();
      console.log(`✅ BigQuery connected to project: ${project}`);
    } catch (testError: any) {
      console.warn('⚠️ BigQuery connection test failed:', testError.message);
    }
    
    return bigqueryClient;
  } catch (error: any) {
    console.warn('❌ BigQuery not available:', error.message);
    return null;
  }
}

async function executeQuery(bigquery: any, query: string, params: any = {}) {
  const options = {
    query,
    params,
    location: 'US',
    jobTimeoutMs: 60000, // 60 second timeout for complex queries
  };

  const [job] = await bigquery.createQueryJob(options);
  const [rows] = await job.getQueryResults();
  return rows;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const packageName = searchParams.get("package");
  const queryType = searchParams.get("type") || "all";
  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");

  if (!packageName) {
    return NextResponse.json(
      { error: "Package name is required" },
      { status: 400 }
    );
  }

  const normalizedName = packageName.toLowerCase();
  const currentYear = new Date().getFullYear();
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth() + 1;

  try {
    const bigquery = await getBigQueryClient();
    
    if (!bigquery) {
      return NextResponse.json(
        { success: false, error: "BigQuery not available" },
        { status: 503 }
      );
    }

    const results: any = {};

    // Total Downloads (All Time)
    if (queryType === "all" || queryType === "total") {
      try {
        const totalQuery = `
          SELECT COUNT(*) AS total_downloads
          FROM \`bigquery-public-data.pypi.file_downloads\`
          WHERE file.project = @packageName
        `;
        const totalRows = await executeQuery(bigquery, totalQuery, { packageName: normalizedName });
        results.totalDownloads = totalRows[0]?.total_downloads || 0;
      } catch (error: any) {
        console.warn('Total downloads query failed:', error.message);
      }
    }

    // Total Downloads of This Year
    if (queryType === "all" || queryType === "yearly") {
      try {
        const yearlyQuery = `
          SELECT COUNT(*) AS total_downloads
          FROM \`bigquery-public-data.pypi.file_downloads\`
          WHERE file.project = @packageName 
            AND EXTRACT(YEAR FROM timestamp) = @currentYear
        `;
        const yearlyRows = await executeQuery(bigquery, yearlyQuery, { 
          packageName: normalizedName,
          currentYear: currentYear 
        });
        results.totalDownloadsThisYear = yearlyRows[0]?.total_downloads || 0;
      } catch (error: any) {
        console.warn('Yearly downloads query failed:', error.message);
      }
    }

    // Monthly Downloads of This Year
    if (queryType === "all" || queryType === "monthly") {
      try {
        const monthlyQuery = `
          SELECT 
            EXTRACT(MONTH FROM timestamp) AS month, 
            COUNT(*) AS num_downloads
          FROM \`bigquery-public-data.pypi.file_downloads\`
          WHERE file.project = @packageName 
            AND EXTRACT(YEAR FROM timestamp) = @currentYear
          GROUP BY month
          ORDER BY month ASC
        `;
        const monthlyRows = await executeQuery(bigquery, monthlyQuery, { 
          packageName: normalizedName,
          currentYear: currentYear 
        });
        results.monthlyDownloads = monthlyRows.map((row: any) => ({
          month: parseInt(row.month) || 0,
          downloads: parseInt(row.num_downloads) || 0,
        }));
      } catch (error: any) {
        console.warn('Monthly downloads query failed:', error.message);
      }
    }

    // Top 10 Dates by Download Count (This Year)
    if (queryType === "all" || queryType === "topDates") {
      try {
        const topDatesQuery = `
          SELECT 
            DATE(timestamp) AS download_date, 
            COUNT(*) AS num_downloads
          FROM \`bigquery-public-data.pypi.file_downloads\`
          WHERE file.project = @packageName 
            AND EXTRACT(YEAR FROM timestamp) = @currentYear
          GROUP BY download_date
          ORDER BY num_downloads DESC
          LIMIT 10
        `;
        const topDatesRows = await executeQuery(bigquery, topDatesQuery, { 
          packageName: normalizedName,
          currentYear: currentYear 
        });
        results.topDates = topDatesRows.map((row: any) => {
          const dateValue = row.download_date?.value || row.download_date;
          return {
            date: typeof dateValue === 'string' ? dateValue : dateValue.toISOString().split('T')[0],
            downloads: parseInt(row.num_downloads) || 0,
          };
        });
      } catch (error: any) {
        console.warn('Top dates query failed:', error.message);
      }
    }

    // Top 10 Countries This Year
    if (queryType === "all" || queryType === "topCountries") {
      try {
        const topCountriesQuery = `
          SELECT 
            country_code, 
            COUNT(*) AS num_downloads
          FROM \`bigquery-public-data.pypi.file_downloads\`
          WHERE file.project = @packageName 
            AND EXTRACT(YEAR FROM timestamp) = @currentYear
            AND country_code IS NOT NULL
          GROUP BY country_code
          ORDER BY num_downloads DESC
          LIMIT 10
        `;
        const topCountriesRows = await executeQuery(bigquery, topCountriesQuery, { 
          packageName: normalizedName,
          currentYear: currentYear 
        });
        results.topCountries = topCountriesRows.map((row: any) => ({
          country: row.country_code || 'Unknown',
          downloads: parseInt(row.num_downloads) || 0,
        }));
      } catch (error: any) {
        console.warn('Top countries query failed:', error.message);
      }
    }

    // Top 10 Countries Today
    if (queryType === "all" || queryType === "topCountriesToday") {
      try {
        const topCountriesTodayQuery = `
          SELECT 
            country_code, 
            COUNT(*) AS num_downloads
          FROM \`bigquery-public-data.pypi.file_downloads\`
          WHERE file.project = @packageName 
            AND DATE(timestamp) = @today
            AND country_code IS NOT NULL
          GROUP BY country_code
          ORDER BY num_downloads DESC
          LIMIT 10
        `;
        const topCountriesTodayRows = await executeQuery(bigquery, topCountriesTodayQuery, { 
          packageName: normalizedName,
          today: today 
        });
        results.topCountriesToday = topCountriesTodayRows.map((row: any) => ({
          country: row.country_code || 'Unknown',
          downloads: parseInt(row.num_downloads) || 0,
        }));
      } catch (error: any) {
        console.warn('Top countries today query failed:', error.message);
      }
    }

    // Top 10 Dates This Month (Custom Date Range)
    if (queryType === "all" || queryType === "topDatesThisMonth") {
      try {
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
        const topDatesMonthQuery = `
          SELECT 
            DATE(timestamp) AS download_date, 
            COUNT(*) AS num_downloads
          FROM \`bigquery-public-data.pypi.file_downloads\`
          WHERE file.project = @packageName 
            AND DATE(timestamp) >= @startOfMonth
            AND DATE(timestamp) <= @today
          GROUP BY download_date
          ORDER BY num_downloads DESC
          LIMIT 10
        `;
        const topDatesMonthRows = await executeQuery(bigquery, topDatesMonthQuery, { 
          packageName: normalizedName,
          startOfMonth: startOfMonth,
          today: today 
        });
        results.topDatesThisMonth = topDatesMonthRows.map((row: any) => {
          const dateValue = row.download_date?.value || row.download_date;
          return {
            date: typeof dateValue === 'string' ? dateValue : dateValue.toISOString().split('T')[0],
            downloads: parseInt(row.num_downloads) || 0,
          };
        });
      } catch (error: any) {
        console.warn('Top dates this month query failed:', error.message);
      }
    }

    // Custom Date Range - Top 10 Dates
    if (queryType === "customRange" && fromDate && toDate) {
      try {
        const customRangeQuery = `
          SELECT 
            DATE(timestamp) AS download_date, 
            COUNT(*) AS num_downloads
          FROM \`bigquery-public-data.pypi.file_downloads\`
          WHERE file.project = @packageName 
            AND DATE(timestamp) >= @fromDate
            AND DATE(timestamp) <= @toDate
          GROUP BY download_date
          ORDER BY num_downloads DESC
          LIMIT 10
        `;
        const customRangeRows = await executeQuery(bigquery, customRangeQuery, { 
          packageName: normalizedName,
          fromDate: fromDate,
          toDate: toDate 
        });
        results.customRangeTopDates = customRangeRows.map((row: any) => {
          const dateValue = row.download_date?.value || row.download_date;
          return {
            date: typeof dateValue === 'string' ? dateValue : dateValue.toISOString().split('T')[0],
            downloads: parseInt(row.num_downloads) || 0,
          };
        });
      } catch (error: any) {
        console.warn('Custom range query failed:', error.message);
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      package: normalizedName,
      source: "bigquery",
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch extended PyPI statistics",
      },
      { status: 500 }
    );
  }
}

