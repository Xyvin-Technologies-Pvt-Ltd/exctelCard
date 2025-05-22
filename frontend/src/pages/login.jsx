import React from "react";
import { TiVendorMicrosoft } from "react-icons/ti";

export default function Login() {
  return (
    <div className="flex h-screen font-sans">
      {/* Left Branding Section */}
      <div className="relative w-1/2 bg-black overflow-hidden flex items-center justify-center">
        {/* Polygon Background */}
        <div
          className="absolute h-full w-full bg-gray-800"
          style={{
            clipPath:
              "polygon(-10% 0%, 40% 0%, 80% 50%, 40% 100%, -5% 100%, 40% 50%)",
          }}
        ></div>

        {/* Logo Text */}
        <h1 className="text-6xl font-bold z-10 text-white flex items-center">
          <span className="text-white">ex</span>
          <span className="text-orange-500">ctel.</span>
        </h1>
      </div>

      {/* Right Login Section */}
      <div className="w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mini logo and label */}
          <div className="flex items-center space-x-2 mb-12">
            <img src="/Group 1.png" alt="Logo Icon" className="w-6 h-6"/>
            <img src="/Group 2.svg" alt="Logo Text" className="h-6"/>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Login</h3>
              <p className="text-gray-500">Welcome back! Please enter your details.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"/>
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-orange-500 hover:text-orange-600">Forgot password?</a>
              </div>
            </div>

            <div className="space-y-4">
              <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium">
                <TiVendorMicrosoft className="text-xl" />
                Sign in with SSO
              </button>

              <button className="w-full bg-white text-gray-700 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition flex items-center justify-center gap-2 font-medium">
                Sign in with password
              </button>
            </div>

            <div className="text-sm text-center text-gray-600">
              Don't have an account?{" "}
              <a href="#" className="text-orange-500 hover:text-orange-600 font-medium">
                Sign up for free
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

