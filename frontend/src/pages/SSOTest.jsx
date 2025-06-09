import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const SSOTest = () => {
  const [backendStatus, setBackendStatus] = useState("checking");
  const [testResults, setTestResults] = useState([]);
  const { user, isAuthenticated, getAuthToken } = useAuth();

  useEffect(() => {
    console.log("🧪 SSO Test Page Loaded");
    testBackendConnection();
  }, []);

  const addTestResult = (test, status, message, data = null) => {
    const result = {
      test,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString(),
    };
    console.log(`🧪 Test: ${test} - ${status}: ${message}`, data);
    setTestResults((prev) => [...prev, result]);
  };

  const testBackendConnection = async () => {
    try {
      addTestResult(
        "Backend Connection",
        "running",
        "Testing backend connection..."
      );

      const response = await fetch("http://localhost:5000/health");
      const data = await response.json();

      if (response.ok) {
        setBackendStatus("connected");
        addTestResult(
          "Backend Connection",
          "success",
          "Backend is running",
          data
        );
      } else {
        setBackendStatus("error");
        addTestResult(
          "Backend Connection",
          "error",
          "Backend returned error",
          data
        );
      }
    } catch (error) {
      setBackendStatus("error");
      addTestResult(
        "Backend Connection",
        "error",
        "Backend is not running",
        error.message
      );
    }
  };

  const testSSOLogin = async () => {
    try {
      addTestResult("SSO Login", "running", "Initiating SSO login test...");

      const response = await fetch("http://localhost:5000/api/auth/login");
      const data = await response.json();

      if (data.success && data.authUrl) {
        addTestResult(
          "SSO Login",
          "success",
          "Auth URL generated successfully",
          {
            authUrl: data.authUrl.substring(0, 100) + "...",
            fullUrl: data.authUrl,
          }
        );
      } else {
        addTestResult(
          "SSO Login",
          "error",
          "Failed to generate auth URL",
          data
        );
      }
    } catch (error) {
      addTestResult(
        "SSO Login",
        "error",
        "Network error during SSO test",
        error.message
      );
    }
  };

  const testTokenVerification = async () => {
    try {
      const token = getAuthToken();

      if (!token) {
        addTestResult(
          "Token Verification",
          "warning",
          "No token found in localStorage"
        );
        return;
      }

      addTestResult(
        "Token Verification",
        "running",
        "Testing token verification..."
      );

      const response = await fetch("http://localhost:5000/api/auth/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        addTestResult(
          "Token Verification",
          "success",
          "Token is valid",
          data.user
        );
      } else {
        addTestResult(
          "Token Verification",
          "error",
          "Token verification failed",
          data
        );
      }
    } catch (error) {
      addTestResult(
        "Token Verification",
        "error",
        "Error during token verification",
        error.message
      );
    }
  };

  const testUserProfile = async () => {
    try {
      const token = getAuthToken();

      if (!token) {
        addTestResult(
          "User Profile",
          "warning",
          "No token available for profile test"
        );
        return;
      }

      addTestResult("User Profile", "running", "Fetching user profile...");

      const response = await fetch("http://localhost:5000/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        addTestResult(
          "User Profile",
          "success",
          "Profile fetched successfully",
          data.user
        );
      } else {
        addTestResult("User Profile", "error", "Failed to fetch profile", data);
      }
    } catch (error) {
      addTestResult(
        "User Profile",
        "error",
        "Error fetching profile",
        error.message
      );
    }
  };

  const testDebugSessions = async () => {
    try {
      addTestResult("Debug Sessions", "running", "Fetching active sessions...");

      const response = await fetch("http://localhost:5000/api/auth/debug");
      const data = await response.json();

      if (data.success) {
        addTestResult(
          "Debug Sessions",
          "success",
          "Active sessions retrieved",
          data.data
        );
      } else {
        addTestResult(
          "Debug Sessions",
          "error",
          "Failed to get sessions",
          data
        );
      }
    } catch (error) {
      addTestResult(
        "Debug Sessions",
        "error",
        "Error fetching sessions",
        error.message
      );
    }
  };

  const clearResults = () => {
    setTestResults([]);
    console.clear();
    console.log("🧪 Test results cleared");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50";
      case "error":
        return "text-red-600 bg-red-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "running":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          SSO Integration Test
        </h1>
        <p className="text-gray-600">
          Test the Azure AD SSO integration and debug the authentication flow
        </p>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Backend Status</h3>
          <div
            className={`inline-flex px-3 py-1 rounded-full text-sm ${
              backendStatus === "connected"
                ? "bg-green-100 text-green-800"
                : backendStatus === "error"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {backendStatus === "connected"
              ? "✅ Connected"
              : backendStatus === "error"
              ? "❌ Error"
              : "⏳ Checking..."}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Authentication</h3>
          <div
            className={`inline-flex px-3 py-1 rounded-full text-sm ${
              isAuthenticated
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {isAuthenticated ? "✅ Authenticated" : "❌ Not Authenticated"}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Current User</h3>
          <p className="text-sm text-gray-600">
            {user ? user.name || user.email : "No user data"}
          </p>
        </div>
      </div>

      {/* Test Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={testBackendConnection}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Test Backend
          </button>
          <button
            onClick={testSSOLogin}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            Test SSO Login
          </button>
          <button
            onClick={testTokenVerification}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Test Token
          </button>
          <button
            onClick={testUserProfile}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg"
          >
            Test Profile
          </button>
          <button
            onClick={testDebugSessions}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
          >
            Debug Sessions
          </button>
          <button
            onClick={clearResults}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Test Results</h2>
          <p className="text-sm text-gray-600 mt-1">
            Check the browser console (F12) for detailed logs
          </p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No test results yet. Run some tests to see the results here.
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(
                    result.status
                  )}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{result.test}</span>
                    <span className="text-xs text-gray-500">
                      {result.timestamp}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{result.message}</p>
                  {result.data && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-600">
                        View Data
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SSOTest;
