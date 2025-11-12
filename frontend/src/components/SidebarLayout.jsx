import React from "react";
import { Link, useNavigate } from "react-router-dom";
import LayoutModern from "../layout/LayoutModern";

/**
 * SidebarLayout component - Wrapper around LayoutModern with back button support
 */
const SidebarLayout = ({ 
  children, 
  backPath, 
  backLabel = "Back", 
  initialCategory = null 
}) => {
  const navigate = useNavigate();

  return (
    <LayoutModern>
      {backPath && (
        <div className="mb-4">
          <button
            onClick={() => navigate(backPath)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {backLabel}
          </button>
        </div>
      )}
      {children}
    </LayoutModern>
  );
};

export default SidebarLayout;

