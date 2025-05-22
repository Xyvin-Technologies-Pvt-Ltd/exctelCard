import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import QRCode from "./pages/QRCode";
import Layout from "./layout/Layout";
import "./App.css";
import Activity from "./pages/Activity";
import Admin from "./pages/Admin";

function App() {
  return (
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
            path="*"
            element={
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/activity" element={<Activity />} />
                  <Route path="/admin" element={<Admin />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;