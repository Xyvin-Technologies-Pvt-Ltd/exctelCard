import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import QRCode from "./pages/QRCode";
import Layout from "./layout/Layout";
import "./App.css";
import Activity from "./pages/Activity";
import Admin from "./pages/Admin";
import ShareView from "./pages/ShareView";
import SSOTest from "./pages/SSOTest";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route
              path="/login"
              element={
                <main>
                  <Login />
                </main>
              }
            />
            <Route
              path="/share/:id"
              element={
                <main>
                  <ShareView />
                </main>
              }
            />
            <Route
              path="/sso-test"
              element={
                <main>
                  <SSOTest />
                </main>
              }
            />
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                      />
                      <Route path="/activity" element={<Activity />} />
                      <Route path="/admin" element={<Admin />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
