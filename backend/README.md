# DigiCard Backend - Azure AD SSO Authentication

This is the backend API for the DigiCard application with Azure Active Directory Single Sign-On (SSO) authentication using MSAL Node.

## Features

- 🔐 **Azure AD SSO Integration** - Secure authentication using Microsoft Azure Active Directory
- 🛡️ **JWT Token Management** - Token generation and validation for API access
- 📚 **Swagger Documentation** - Complete API documentation with interactive testing
- 🔄 **Session Management** - Secure session handling with configurable storage
- 🚦 **Rate Limiting** - Protection against abuse with configurable limits
- 🎯 **Role-based Access Control** - Admin role management and permissions
- 🛟 **Security Middleware** - Helmet, CORS, and other security measures

## Project Structure

```
backend/
├── config/
│   └── azureConfig.js        # Azure AD MSAL configuration
├── modules/
│   └── auth/
│       ├── auth.controller.js # Authentication business logic
│       └── auth.route.js     # Authentication API routes
├── middlewares/
│   └── auth.middleware.js    # JWT authentication middleware
├── validators/
│   └── auth.validator.js     # Request validation schemas
├── swagger/
│   └── auth.swagger.js       # API documentation schemas
├── app.js                    # Main Express application
├── package.json              # Dependencies and scripts
└── env.template              # Environment variables template
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy the `env.template` file to `.env` and fill in your Azure AD details:

```bash
cp env.template .env
```

Update the `.env` file with your Azure AD configuration:

```env
# Azure AD Configuration
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_TENANT_ID=your-azure-tenant-id
AZURE_REDIRECT_URI=http://localhost:5000/api/auth/callback

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here

# Session Secret
SESSION_SECRET=your-session-secret-key-here

# Admin Emails (comma-separated)
ADMIN_EMAILS=admin@yourcompany.com
```

### 3. Azure AD App Registration

To get the Azure AD credentials, you need to register an application in Azure Portal:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the application details:
   - **Name**: DigiCard API
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: Web - `http://localhost:5000/api/auth/callback`
5. After creation, note down:
   - **Application (client) ID** → `AZURE_CLIENT_ID`
   - **Directory (tenant) ID** → `AZURE_TENANT_ID`
6. Go to **Certificates & secrets** and create a new client secret → `AZURE_CLIENT_SECRET`
7. Go to **API permissions** and add:
   - Microsoft Graph → Delegated permissions → `openid`, `profile`, `email`, `User.Read`

### 4. Start the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication Endpoints

| Method | Endpoint             | Description           | Auth Required |
| ------ | -------------------- | --------------------- | ------------- |
| GET    | `/api/auth/login`    | Initiate SSO login    | No            |
| GET    | `/api/auth/callback` | Handle OAuth callback | No            |
| GET    | `/api/auth/profile`  | Get user profile      | Yes           |
| POST   | `/api/auth/logout`   | Logout user           | Yes           |
| POST   | `/api/auth/verify`   | Verify JWT token      | No            |

### Utility Endpoints

| Method | Endpoint    | Description           |
| ------ | ----------- | --------------------- |
| GET    | `/`         | API welcome message   |
| GET    | `/health`   | Health check          |
| GET    | `/api/docs` | Swagger documentation |

## Authentication Flow

### 1. Frontend Login Initiation

Frontend calls `/api/auth/login` to get the Azure AD authentication URL:

```javascript
const response = await fetch("/api/auth/login");
const { authUrl } = await response.json();
window.location.href = authUrl; // Redirect to Azure AD
```

### 2. Azure AD Authentication

User is redirected to Azure AD login page and authenticates.

### 3. Callback Handling

Azure AD redirects back to `/api/auth/callback` with authorization code.
Backend exchanges code for tokens and redirects to frontend with JWT.

### 4. Frontend Token Storage

Frontend receives JWT token and stores it for API calls:

```javascript
// Store token
localStorage.setItem("authToken", token);

// Use token for API calls
fetch("/api/auth/profile", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## Usage Examples

### Frontend Integration

```javascript
// Login
const login = async () => {
  const response = await fetch("/api/auth/login");
  const data = await response.json();
  window.location.href = data.authUrl;
};

// Get user profile
const getProfile = async () => {
  const token = localStorage.getItem("authToken");
  const response = await fetch("/api/auth/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
};

// Logout
const logout = async () => {
  const token = localStorage.getItem("authToken");
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  localStorage.removeItem("authToken");
  window.location.href = data.logoutUrl;
};
```

## API Documentation

Once the server is running, visit `http://localhost:5000/api/docs` for interactive Swagger documentation.

## Security Features

- **CORS Protection**: Configured for frontend domain
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet Security**: Security headers and protections
- **JWT Validation**: Secure token verification
- **Session Management**: Secure session handling
- **State Parameter**: CSRF protection for OAuth flow

## Environment Variables Reference

| Variable              | Description             | Required | Default                                 |
| --------------------- | ----------------------- | -------- | --------------------------------------- |
| `PORT`                | Server port             | No       | 5000                                    |
| `NODE_ENV`            | Environment             | No       | development                             |
| `FRONTEND_URL`        | Frontend URL for CORS   | No       | http://localhost:3000                   |
| `AZURE_CLIENT_ID`     | Azure AD Application ID | Yes      | -                                       |
| `AZURE_CLIENT_SECRET` | Azure AD Client Secret  | Yes      | -                                       |
| `AZURE_TENANT_ID`     | Azure AD Tenant ID      | Yes      | -                                       |
| `AZURE_REDIRECT_URI`  | OAuth redirect URI      | No       | http://localhost:5000/api/auth/callback |
| `JWT_SECRET`          | JWT signing secret      | Yes      | -                                       |
| `SESSION_SECRET`      | Session signing secret  | Yes      | -                                       |
| `ADMIN_EMAILS`        | Admin user emails       | No       | -                                       |

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use HTTPS URLs for all redirect URIs
3. Configure Redis for session storage
4. Set up proper logging
5. Use environment-specific secrets
6. Enable security features in Azure AD

## Troubleshooting

### Common Issues

1. **Authentication fails**: Check Azure AD app registration and redirect URIs
2. **Token invalid**: Verify JWT_SECRET matches between requests
3. **CORS errors**: Ensure FRONTEND_URL is correctly configured
4. **Rate limiting**: Adjust rate limits for your use case

### Debug Mode

Set `LOG_LEVEL=debug` in your `.env` file for detailed logging.

## Contributing

1. Follow the existing code structure
2. Add appropriate validation for new endpoints
3. Update Swagger documentation for API changes
4. Ensure proper error handling
5. Add security considerations for new features
