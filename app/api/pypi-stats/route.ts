import { NextRequest, NextResponse } from "next/server";

/**
 * API Route for PyPI download statistics using Google BigQuery
 * 
 * Uses the official PyPI download statistics dataset from Google BigQuery:
 * bigquery-public-data.pypi.file_downloads
 * 
 * To enable BigQuery:
 * 1. Set up Google Cloud Project
 * 2. Enable BigQuery API
 * 3. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
 *    OR use Application Default Credentials
 * 
 * Free tier: 1TB queries per month
 */

let bigqueryClient: any = null;

async function getBigQueryClient() {
  if (bigqueryClient) {
    return bigqueryClient;
  }

  try {
    // Dynamic import to avoid errors if package not available
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
      // Handle relative paths
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
    
    // Test connection by getting project
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const packageName = searchParams.get("package");
  const period = searchParams.get("period") || "month";

  if (!packageName) {
    return NextResponse.json(
      { error: "Package name is required" },
      { status: 400 }
    );
  }

  const normalizedName = packageName.toLowerCase();

  try {
    // Try BigQuery first (official source)
    const bigquery = await getBigQueryClient();
    
    if (bigquery) {
      try {
        // Calculate date range based on period
        const daysMap: Record<string, number> = {
          day: 30,
          week: 90,
          month: 365,
        };
        const days = daysMap[period] || 365;

        const query = `
          SELECT
            DATE(timestamp) as date,
            COUNT(*) as downloads
          FROM \`bigquery-public-data.pypi.file_downloads\`
          WHERE file.project = @packageName
            AND DATE(timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY)
            AND DATE(timestamp) <= CURRENT_DATE()
          GROUP BY date
          ORDER BY date ASC
        `;

        const options = {
          query,
          params: {
            packageName: normalizedName,
            days: days,
          },
          location: 'US', // BigQuery location
          jobTimeoutMs: 30000, // 30 second timeout
        };

        console.log(`Querying BigQuery for package: ${normalizedName}, period: ${period}, days: ${days}`);
        const [job] = await bigquery.createQueryJob(options);
        console.log(`BigQuery job created: ${job.id}`);
        
        // Wait for job to complete
        const [rows] = await job.getQueryResults();
        console.log(`BigQuery query completed, rows: ${rows.length}`);

        if (rows && rows.length > 0) {
          const formattedData = rows.map((row: any) => {
            const dateValue = row.date?.value || row.date;
            return {
              date: typeof dateValue === 'string' ? dateValue : dateValue.toISOString().split('T')[0],
              downloads: parseInt(row.downloads) || 0,
            };
          });

          return NextResponse.json({
            success: true,
            data: formattedData,
            source: "bigquery",
            package: normalizedName,
          });
        }
      } catch (bigqueryError: any) {
        console.warn('BigQuery query failed:', bigqueryError.message);
        // Fall through to pypistats.org
      }
    }

    // Fallback to pypistats.org API
    try {
      const url = `https://pypistats.org/api/packages/${normalizedName}/recent?period=${period}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          return NextResponse.json({
            success: true,
            data: data.data || [],
            source: "pypistats.org",
            package: normalizedName,
          });
        }
      }
    } catch (pypistatsError) {
      // Continue to error response
    }

    // If both fail, return error with BigQuery info
    return NextResponse.json(
      {
        success: false,
        error: "Download statistics not available",
        message: `Package "${packageName}" download statistics are not available through public APIs.`,
        bigqueryInfo: {
          dataset: "bigquery-public-data.pypi.file_downloads",
          documentation: "https://packaging.python.org/en/latest/guides/analyzing-pypi-package-downloads/",
          exampleQuery: `SELECT COUNT(*) AS num_downloads
FROM \`bigquery-public-data.pypi.file_downloads\`
WHERE file.project = '${normalizedName}'
  AND DATE(timestamp) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND CURRENT_DATE()`,
          setupInstructions: "To enable BigQuery: 1) Set up GCP project, 2) Enable BigQuery API, 3) Set GOOGLE_APPLICATION_CREDENTIALS env var",
        },
      },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch PyPI download statistics",
      },
      { status: 500 }
    );
  }
}

