# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Please report (suspected) security vulnerabilities to **[INSERT EMAIL]**. You will receive a response within 48 hours. If the issue is confirmed, we will release a patch as soon as possible depending on complexity but historically within a few days.

## Security Best Practices

When using this project:

1. **Never commit credentials** - Always use environment variables
2. **Keep dependencies updated** - Run `npm audit` regularly
3. **Use HTTPS** - Always use HTTPS in production
4. **Validate inputs** - All user inputs are validated server-side
5. **Rate limiting** - API routes implement rate limiting

## Known Security Considerations

- Google Cloud credentials are stored as environment variables, never in code
- API routes validate all inputs before processing
- CORS is properly configured for API endpoints
- No sensitive data is stored client-side
