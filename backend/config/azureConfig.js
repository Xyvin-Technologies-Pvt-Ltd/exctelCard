require("dotenv").config();

const azureConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: "Info",
    },
  },
};

const redirectUri =
  process.env.AZURE_REDIRECT_URI || "http://localhost:5000/api/auth/callback";
const postLogoutRedirectUri =
  process.env.AZURE_POST_LOGOUT_REDIRECT_URI || "http://localhost:5173/login";
  const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

console.log(process.env.FRONTEND_URL);
console.log(process.env.AZURE_REDIRECT_URI);
console.log(process.env.AZURE_POST_LOGOUT_REDIRECT_URI);
console.log(process.env.AZURE_CLIENT_ID);
console.log(process.env.AZURE_CLIENT_SECRET);
console.log(process.env.AZURE_TENANT_ID);
console.log(process.env.AZURE_AUTHORITY);


module.exports = {
  azureConfig,
  redirectUri,
  postLogoutRedirectUri,
  FRONTEND_URL,
};
