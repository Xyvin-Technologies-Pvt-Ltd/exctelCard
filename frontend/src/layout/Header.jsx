import React from "react";
import { Link, useLocation } from "react-router-dom";

const Header = ({ toggleSidebar, navigationItems }) => {
  const location = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button
            className="p-2 rounded-md lg:hidden text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={toggleSidebar}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <h1 className="text-lg font-semibold text-gray-schaft800">
            {navigationItems.find((item) => item.path === location.pathname)
              ?.name || "Profile"}
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
