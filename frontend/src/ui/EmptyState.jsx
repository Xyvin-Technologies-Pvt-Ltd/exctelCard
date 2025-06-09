import React from "react";
import Button from "./Button";

const EmptyState = ({
  icon,
  title,
  description,
  action,
  actionText = "Get Started",
  className = "",
}) => {
  const defaultIcon = (
    <svg
      className="w-16 h-16 text-gray-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m14-6h-2M4 7h2m12 0h2M8 21h8"
      />
    </svg>
  );

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      <div className="mb-4">{icon || defaultIcon}</div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title || "No data available"}
      </h3>

      {description && (
        <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      )}

      {action && (
        <Button onClick={action} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  );
};

// Predefined empty states for common scenarios
export const NoDataFound = ({ onRetry }) => (
  <EmptyState
    icon={
      <svg
        className="w-16 h-16 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    }
    title="No data found"
    description="There's nothing to display here yet. Try adjusting your filters or check back later."
    action={onRetry}
    actionText="Refresh"
  />
);

export const NoActivityYet = ({ onCreate }) => (
  <EmptyState
    icon={
      <svg
        className="w-16 h-16 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    }
    title="No activity yet"
    description="Your activity will appear here as people interact with your digital business card."
    action={onCreate}
    actionText="Share Your Card"
  />
);

export const NoResults = ({ onClear }) => (
  <EmptyState
    icon={
      <svg
        className="w-16 h-16 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    }
    title="No results found"
    description="We couldn't find any matches for your search. Try different keywords or clear the filters."
    action={onClear}
    actionText="Clear Filters"
  />
);

export default EmptyState;
