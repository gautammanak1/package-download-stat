# GitHub Secret Setup Guide

## Step 1: Get JSON Content

Run this command in your terminal:

```bash
cat extreme-battery-463111-f5.json
```

## Step 2: Add to GitHub Secrets

1. Go to: https://github.com/gautammanak1/package-download-stat/settings/secrets/actions
2. Click **"New repository secret"**
3. **Name:** `GOOGLE_APPLICATION_CREDENTIALS_JSON`
4. **Value:** Paste the ENTIRE JSON content (including all braces, quotes, etc.)
   - Make sure there are NO extra spaces at the beginning or end
   - The JSON should start with `{` and end with `}`
   - Copy everything from the file exactly as it is
5. Click **"Add secret"**

## Step 3: Verify JSON Format

The JSON should look like this (example):

```json
{
  "type": "service_account",
  "project_id": "extreme-battery-463111-f5",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  ...
}
```

## Important Notes

- ✅ Copy the ENTIRE JSON content (all lines)
- ✅ Don't add extra quotes or escape characters
- ✅ Don't add line breaks manually
- ✅ Paste exactly as it appears in the file
- ✅ The secret should be one continuous string (GitHub handles multiline)

## Troubleshooting

If the workflow still shows "secret not found":

1. **Check secret name:** Must be exactly `GOOGLE_APPLICATION_CREDENTIALS_JSON` (case-sensitive)
2. **Verify secret exists:** Go to Settings → Secrets → Actions and confirm it's listed
3. **Check JSON validity:** The JSON should be valid (no syntax errors)
4. **Re-run workflow:** After adding secret, manually trigger the workflow or push a new commit

## Testing

After adding the secret, push a commit or manually trigger the workflow. Check the logs for:

```
✅ Google Cloud credentials file created
✅ JSON is valid (if jq is available)
✅ Using BigQuery credentials from GOOGLE_APPLICATION_CREDENTIALS_JSON env var
✅ BigQuery connected to project: extreme-battery-463111-f5
```

