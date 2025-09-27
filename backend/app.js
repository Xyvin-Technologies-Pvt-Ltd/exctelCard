const express = require("express");
const cors = require("cors");
const session = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const connectDB = require("./config/database");
const morgan = require("morgan");
require("dotenv").config();

// Connect to MongoDB
connectDB();

const app = express();

// Import routes
const authRoutes = require("./modules/auth/auth.route");
const adminRoutes = require("./modules/admin/admin.route");
const activityRoutes = require("./modules/users/activity.route");
const profileRoutes = require("./modules/profile/profile.route");
const shareRoutes = require("./modules/share/share.route");
const qrcodeRoutes = require("./modules/qrcode/qrcode.route");

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for Swagger UI
  })
);

app.use(
  cors({
    origin: [
      "https://bizcard.exctel.com",
      "https://api-bizcard.exctel.com",
      "http://localhost:5173",
      "http://localhost:5000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Session middleware (replace with Redis in production)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api/", limiter);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DigiCard API",
      version: "1.0.0",
      description:
        "Digital Business Card Application API with Azure AD SSO authentication",
      contact: {
        name: "DigiCard Team",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./modules/*//*.route.js", "./swagger//*.swagger.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "DigiCard API Documentation",
  })
);

app.use(morgan("tiny")); // Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/qrcode", qrcodeRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "DigiCard API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to DigiCard API",
    documentation: "/api/docs",
    health: "/health",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error:", error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 DigiCard API server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;
