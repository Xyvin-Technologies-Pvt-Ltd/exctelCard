# Environment Setup Guide for ExctelCard Backend

## Quick Start

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update the following variables in `.env`:**

### Required for Basic Functionality:
- `JWT_SECRET` - Change to a strong, random string
- `JWT_REFRESH_SECRET` - Change to a different strong, random string
- `SESSION_SECRET` - Change to a strong, random string
- `MONGODB_URI` - Your MongoDB connection string

### Required for SSO (Microsoft/Google):
- `MICROSOFT_CLIENT_ID` - From Azure App Registration
- `MICROSOFT_CLIENT_SECRET` - From Azure App Registration  
- `MICROSOFT_TENANT_ID` - Your Azure tenant ID
- `GOOGLE_CLIENT_ID` - From Google Console
- `GOOGLE_CLIENT_SECRET` - From Google Console

## Environment Variables Explained

### Server Configuration
- `NODE_ENV` - Set to 'development' or 'production'
- `PORT` - Server port (default: 5000)
- `API_VERSION` - API version prefix (default: v1)

### Database
- `MONGODB_URI` - MongoDB connection string
- `DB_NAME` - Database name (optional if included in URI)

### Authentication
- `JWT_SECRET` - Secret for signing JWT tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `JWT_EXPIRES_IN` - Token expiration time (e.g., '24h', '7d')
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration

### Microsoft SSO Setup
1. Go to Azure Active Directory > App registrations
2. Create new registration or use existing
3. Add redirect URI: `http://localhost:5000/api/auth/microsoft/callback`
4. Generate client secret
5. Copy Client ID, Client Secret, and Tenant ID to .env

### Google SSO Setup
1. Go to Google Cloud Console > APIs & Services > Credentials
2. Create OAuth 2.0 Client ID
3. Add redirect URI: `http://localhost:5000/api/auth/google/callback`
4. Copy Client ID and Client Secret to .env

### Security
- `RATE_LIMIT_WINDOW_MS` - Rate limiting window (default: 15 minutes)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: 100)
- `BCRYPT_ROUNDS` - Password hashing strength (default: 12)

### File Uploads
- `MAX_FILE_SIZE` - Maximum file size in bytes (default: 5MB)
- `ALLOWED_IMAGE_TYPES` - Comma-separated list of allowed MIME types
- `UPLOAD_DIR` - Directory for file uploads

### Company Settings
- `COMPANY_NAME` - Your company name (default: Exctel)
- `COMPANY_DOMAIN` - Your company domain
- `COMPANY_WEBSITE` - Your company website URL
- `COMPANY_LOGO_URL` - URL to your company logo

### Default Admin Account
- `SUPER_ADMIN_EMAIL` - Default admin email
- `SUPER_ADMIN_PASSWORD` - Default admin password (change this!)
- `SUPER_ADMIN_NAME` - Default admin name

## Production Considerations

### Security
1. Use strong, unique secrets for all JWT and session keys
2. Set `NODE_ENV=production`
3. Set `SESSION_SECURE=true` for HTTPS
4. Set `DEBUG=false` and `DETAILED_ERRORS=false`
5. Use environment-specific MongoDB URI
6. Configure proper CORS origins

### Performance
1. Set up Redis for caching and sessions
2. Configure proper MongoDB indexes
3. Use PM2 or similar for process management
4. Set up monitoring and logging

### SSO Configuration
1. Update redirect URIs to production URLs
2. Configure proper scopes and permissions
3. Test authentication flows thoroughly

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or connection string is correct
- Check network connectivity for cloud databases
- Verify authentication credentials

### SSO Issues
- Check redirect URIs match exactly
- Verify client IDs and secrets are correct
- Ensure proper scopes are configured
- Check Azure/Google Console for error logs

### JWT Issues
- Ensure JWT secrets are set and consistent
- Check token expiration times
- Verify frontend and backend are using same secrets

## Development Tips

1. Use `nodemon` for auto-restart during development
2. Set `LOG_LEVEL=debug` for detailed logging
3. Enable `SEED_DATABASE=true` for sample data
4. Use `DEBUG=true` for detailed error messages

