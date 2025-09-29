const UserActivity = require("../modules/users/userActivity.model");

class ErrorHandler {
  constructor() {
    this.errorTypes = {
      AUTHENTICATION: "authentication",
      AUTHORIZATION: "authorization",
      NETWORK: "network",
      VALIDATION: "validation",
      DATABASE: "database",
      EXTERNAL_API: "external_api",
      UNKNOWN: "unknown",
    };
  }

  /**
   * Categorize error type based on error properties
   */
  categorizeError(error) {
    if (error.status === 401 || error.message?.includes("unauthorized")) {
      return this.errorTypes.AUTHENTICATION;
    }
    if (error.status === 403 || error.message?.includes("forbidden")) {
      return this.errorTypes.AUTHORIZATION;
    }
    if (
      error.code === "ENOTFOUND" ||
      error.code === "ECONNREFUSED" ||
      error.code === "ETIMEDOUT"
    ) {
      return this.errorTypes.NETWORK;
    }
    if (
      error.name === "ValidationError" ||
      error.message?.includes("validation")
    ) {
      return this.errorTypes.VALIDATION;
    }
    if (error.name === "MongoError" || error.message?.includes("database")) {
      return this.errorTypes.DATABASE;
    }
    if (
      error.config?.url?.includes("graph.microsoft.com") ||
      error.response?.config?.url?.includes("graph.microsoft.com")
    ) {
      return this.errorTypes.EXTERNAL_API;
    }
    return this.errorTypes.UNKNOWN;
  }

  /**
   * Extract detailed error information
   */
  extractErrorDetails(error) {
    const errorType = this.categorizeError(error);

    const details = {
      type: errorType,
      message: error.message || "Unknown error",
      timestamp: new Date().toISOString(),
      stack: error.stack,
    };

    // Add specific details based on error type
    switch (errorType) {
      case this.errorTypes.AUTHENTICATION:
        details.details = {
          status: error.status,
          code: error.code,
          description:
            "Authentication failed - check credentials or token validity",
        };
        break;

      case this.errorTypes.AUTHORIZATION:
        details.details = {
          status: error.status,
          code: error.code,
          description:
            "Authorization failed - check permissions or access rights",
        };
        break;

      case this.errorTypes.NETWORK:
        details.details = {
          code: error.code,
          errno: error.errno,
          syscall: error.syscall,
          hostname: error.hostname,
          description: "Network connectivity issue",
        };
        break;

      case this.errorTypes.EXTERNAL_API:
        details.details = {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.response?.data,
          description: "External API call failed",
        };
        break;

      case this.errorTypes.VALIDATION:
        details.details = {
          errors: error.errors || error.details,
          description: "Data validation failed",
        };
        break;

      case this.errorTypes.DATABASE:
        details.details = {
          code: error.code,
          errmsg: error.errmsg,
          description: "Database operation failed",
        };
        break;

      default:
        details.details = {
          name: error.name,
          description: "Unknown error type",
        };
    }

    return details;
  }

  /**
   * Log error with context
   */
  async logError(error, context = {}) {
    const errorDetails = this.extractErrorDetails(error);

    const logEntry = {
      ...errorDetails,
      context: {
        userId: context.userId || null,
        action: context.action || "unknown",
        source: context.source || "unknown",
        timestamp: new Date(),
        ...context,
      },
    };

    // Console logging with different levels
    if (errorDetails.type === this.errorTypes.EXTERNAL_API) {
      console.error("🌐 External API Error:", {
        type: errorDetails.type,
        message: errorDetails.message,
        details: errorDetails.details,
        context: logEntry.context,
      });
    } else if (errorDetails.type === this.errorTypes.AUTHORIZATION) {
      console.error("🔒 Authorization Error:", {
        type: errorDetails.type,
        message: errorDetails.message,
        details: errorDetails.details,
        context: logEntry.context,
      });
    } else {
      console.error("❌ Error:", logEntry);
    }

    // Store in database for tracking
    try {
      await UserActivity.trackActivity({
        userId: context.userId || null,
        activityType: "error",
        source: context.source || "system",
        visitorInfo: {
          ipAddress: context.ipAddress || "127.0.0.1",
          userAgent: context.userAgent || "ErrorHandler/1.0",
        },
        metadata: {
          error: logEntry,
          action: context.action || "unknown",
        },
      });
    } catch (dbError) {
      console.error("Failed to log error to database:", dbError.message);
    }

    return logEntry;
  }

  /**
   * Create user-friendly error response
   */
  createErrorResponse(error, context = {}) {
    const errorDetails = this.extractErrorDetails(error);

    let userMessage = "An unexpected error occurred";
    let statusCode = 500;

    switch (errorDetails.type) {
      case this.errorTypes.AUTHENTICATION:
        userMessage = "Authentication failed. Please check your credentials.";
        statusCode = 401;
        break;
      case this.errorTypes.AUTHORIZATION:
        userMessage =
          "Access denied. You don't have permission to perform this action.";
        statusCode = 403;
        break;
      case this.errorTypes.NETWORK:
        userMessage =
          "Network error. Please check your connection and try again.";
        statusCode = 503;
        break;
      case this.errorTypes.EXTERNAL_API:
        userMessage = "External service error. Please try again later.";
        statusCode = 502;
        break;
      case this.errorTypes.VALIDATION:
        userMessage = "Invalid data provided. Please check your input.";
        statusCode = 400;
        break;
      case this.errorTypes.DATABASE:
        userMessage = "Database error. Please try again later.";
        statusCode = 500;
        break;
    }

    return {
      success: false,
      message: userMessage,
      error: {
        type: errorDetails.type,
        message: errorDetails.message,
        ...(process.env.NODE_ENV === "development" && {
          details: errorDetails.details,
          stack: errorDetails.stack,
        }),
      },
      statusCode,
    };
  }

  /**
   * Handle Microsoft Graph API specific errors
   */
  handleGraphAPIError(error, context = {}) {
    const errorDetails = this.extractErrorDetails(error);

    // Extract Graph API specific error information
    const graphError = error.response?.data?.error || {};

    const graphErrorDetails = {
      ...errorDetails,
      graphAPI: {
        code: graphError.code,
        message: graphError.message,
        innerError: graphError.innerError,
        target: graphError.target,
        details: graphError.details,
        requestId: error.response?.headers?.["request-id"],
        clientRequestId: error.response?.headers?.["client-request-id"],
        correlationId: error.response?.headers?.["x-ms-correlation-id"],
      },
    };

    // Log the detailed Graph API error
    console.error("🌐 Microsoft Graph API Error:", graphErrorDetails);

    // Determine user-friendly message based on Graph API error code
    let userMessage = "Microsoft Graph API error occurred";
    let statusCode = 502;

    switch (graphError.code) {
      case "InvalidAuthenticationToken":
        userMessage = "Authentication token is invalid or expired";
        statusCode = 401;
        break;
      case "InsufficientPrivileges":
        userMessage = "Insufficient privileges to access Microsoft Graph API";
        statusCode = 403;
        break;
      case "Forbidden":
        userMessage = "Access to Microsoft Graph API is forbidden";
        statusCode = 403;
        break;
      case "ServiceUnavailable":
        userMessage = "Microsoft Graph API is temporarily unavailable";
        statusCode = 503;
        break;
      case "TooManyRequests":
        userMessage =
          "Too many requests to Microsoft Graph API. Please try again later";
        statusCode = 429;
        break;
      default:
        userMessage = `Microsoft Graph API error: ${
          graphError.message || "Unknown error"
        }`;
    }

    return {
      success: false,
      message: userMessage,
      error: {
        type: "external_api",
        message: graphError.message || error.message,
        code: graphError.code,
        ...(process.env.NODE_ENV === "development" && {
          details: graphErrorDetails,
          requestId: graphErrorDetails.graphAPI.requestId,
        }),
      },
      statusCode,
    };
  }

  /**
   * Handle auto-sync specific errors
   */
  async handleAutoSyncError(error, context = {}) {
    const enhancedContext = {
      ...context,
      action: "auto_sync_users",
      source: "auto_sync",
    };

    // Log the error
    await this.logError(error, enhancedContext);

    // Handle Graph API errors specifically
    if (error.config?.url?.includes("graph.microsoft.com")) {
      return this.handleGraphAPIError(error, enhancedContext);
    }

    // Handle other errors
    return this.createErrorResponse(error, enhancedContext);
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

module.exports = errorHandler;
