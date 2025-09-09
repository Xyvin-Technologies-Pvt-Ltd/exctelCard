import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { getActivities, getActivityStats } from "../api/activities";

const ActivityItem = ({ activity }) => {
  const getIcon = (type) => {
    switch (type) {
      case "scan":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
        );
      case "website view":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.34 22.9326L18.39 19.9826V22.2076H16.39V16.5576H22.04V18.5576H19.79L22.74 21.5076L21.34 22.9326ZM12.39 22.5576C11.0067 22.5576 9.70667 22.2951 8.49 21.7701C7.27333 21.2451 6.215 20.5326 5.315 19.6326C4.415 18.7326 3.7025 17.6743 3.1775 16.4576C2.6525 15.241 2.39 13.941 2.39 12.5576C2.39 11.1743 2.6525 9.87428 3.1775 8.65762C3.7025 7.44095 4.415 6.38262 5.315 5.48262C6.215 4.58262 7.27333 3.87012 8.49 3.34512C9.70667 2.82012 11.0067 2.55762 12.39 2.55762C13.7733 2.55762 15.0733 2.82012 16.29 3.34512C17.5067 3.87012 18.565 4.58262 19.465 5.48262C20.365 6.38262 21.0775 7.44095 21.6025 8.65762C22.1275 9.87428 22.39 11.1743 22.39 12.5576C22.39 12.891 22.3733 13.2243 22.34 13.5576C22.3067 13.891 22.2567 14.2243 22.19 14.5576H20.14C20.2233 14.2243 20.2858 13.891 20.3275 13.5576C20.3692 13.2243 20.39 12.891 20.39 12.5576C20.39 12.2243 20.3692 11.891 20.3275 11.5576C20.2858 11.2243 20.2233 10.891 20.14 10.5576H16.74C16.79 10.891 16.8275 11.2243 16.8525 11.5576C16.8775 11.891 16.89 12.2243 16.89 12.5576C16.89 12.891 16.8775 13.2243 16.8525 13.5576C16.8275 13.891 16.79 14.2243 16.74 14.5576H14.74C14.79 14.2243 14.8275 13.891 14.8525 13.5576C14.8775 13.2243 14.89 12.891 14.89 12.5576C14.89 12.2243 14.8775 11.891 14.8525 11.5576C14.8275 11.2243 14.79 10.891 14.74 10.5576H10.04C9.99 10.891 9.9525 11.2243 9.9275 11.5576C9.9025 11.891 9.89 12.2243 9.89 12.5576C9.89 12.891 9.9025 13.2243 9.9275 13.5576C9.9525 13.891 9.99 14.2243 10.04 14.5576H13.39V16.5576H10.49C10.69 17.2743 10.9483 17.9618 11.265 18.6201C11.5817 19.2785 11.9567 19.9076 12.39 20.5076C12.7233 20.5076 13.0567 20.4868 13.39 20.4451C13.7233 20.4035 14.0567 20.3659 14.39 20.3326V22.3826C14.0567 22.416 13.7233 22.4535 13.39 22.4951C13.0567 22.5368 12.7233 22.5576 12.39 22.5576ZM4.64 14.5576H8.04C7.99 14.2243 7.9525 13.891 7.9275 13.5576C7.9025 13.2243 7.89 12.891 7.89 12.5576C7.89 12.2243 7.9025 11.891 7.9275 11.5576C7.9525 11.2243 7.99 10.891 8.04 10.5576H4.64C4.55667 10.891 4.49417 11.2243 4.4525 11.5576C4.41083 11.891 4.39 12.2243 4.39 12.5576C4.39 12.891 4.41083 13.2243 4.4525 13.5576C4.49417 13.891 4.55667 14.2243 4.64 14.5576ZM5.49 8.55762H8.44C8.59 7.94095 8.7775 7.33678 9.0025 6.74512C9.2275 6.15345 9.49 5.57428 9.79 5.00762C8.87333 5.30762 8.04833 5.76178 7.315 6.37012C6.58167 6.97845 5.97333 7.70762 5.49 8.55762ZM9.79 20.1076C9.49 19.541 9.2275 18.9618 9.0025 18.3701C8.7775 17.7785 8.59 17.1743 8.44 16.5576H5.49C5.97333 17.4076 6.58167 18.1368 7.315 18.7451C8.04833 19.3535 8.87333 19.8076 9.79 20.1076ZM10.49 8.55762H14.29C14.09 7.84095 13.8317 7.15345 13.515 6.49512C13.1983 5.83678 12.8233 5.20762 12.39 4.60762C11.9567 5.20762 11.5817 5.83678 11.265 6.49512C10.9483 7.15345 10.69 7.84095 10.49 8.55762ZM16.34 8.55762H19.29C18.8067 7.70762 18.1983 6.97845 17.465 6.37012C16.7317 5.76178 15.9067 5.30762 14.99 5.00762C15.29 5.57428 15.5525 6.15345 15.7775 6.74512C16.0025 7.33678 16.19 7.94095 16.34 8.55762Z"
              fill="#1EBBB8"
            />
          </svg>
        );
      case "download":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        );
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case "scan":
        return "text-green-600 bg-green-50";
      case "website view":
        return "text-[#dbf4ff] bg-[#dbf4ff]/50";
      case "download":
        return "text-primary-500 bg-primary-50";
      default:
        return "text-accent-500 bg-accent-50";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getTypeStyle(
          activity.type
        )}`}
      >
        {getIcon(activity.type)}
      </div>
      <div className="ml-4 flex-grow text-left">
        <p className="text-sm font-medium text-gray-800">
          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}{" "}
          activity
        </p>
        <div className="flex text-xs text-gray-500 space-x-2">
          <span>IP: {activity.ipAddress}</span>
          <span>•</span>
          <span>{activity.userAgent?.split(" ")[0] || "Unknown device"}</span>
        </div>
      </div>
      <div className="flex-shrink-0 text-left">
        <p className="text-xs text-gray-500">
          {formatDate(activity.timestamp)}
        </p>
      </div>
    </div>
  );
};

const Activity = () => {
  const [filter, setFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("all");

  // Fetch activities with filters
  const {
    data: activitiesData,
    isLoading: isLoadingActivities,
    error: activitiesError,
  } = useQuery({
    queryKey: ["activities", filter, timeRange],
    queryFn: () => getActivities({ type: filter, timeRange }),
  });

  // Fetch activity stats
  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["activityStats"],
    queryFn: getActivityStats,
  });

  const activities = activitiesData?.activities || [];
  const stats = statsData?.stats || {
    total: 0,
    scans: 0,
    downloads: 0,
    websiteViews: 0,
  };

  // Show loading state
  if (isLoadingActivities || isLoadingStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Show error state
  if (activitiesError || statsError) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading activities:{" "}
        {activitiesError?.message || statsError?.message}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 text-left">
        <h1 className="text-2xl font-bold text-gray-800">Activity Log</h1>
        <p className="text-gray-600">
          Track all interactions with your digital business card
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-center">
            <div className="bg-primary-50 p-3 rounded-full">
              <svg
                className="w-7 h-7 text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-sm font-medium text-gray-500">
                Total Activity
              </h3>
              <p className="text-2xl font-semibold text-gray-800">
                {stats.total}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="bg-[#dbf4ff]/50 p-3 rounded-full">
              <svg
                className="w-7 h-7 text-[#1EBBB8]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M21.34 22.9326L18.39 19.9826V22.2076H16.39V16.5576H22.04V18.5576H19.79L22.74 21.5076L21.34 22.9326ZM12.39 22.5576C11.0067 22.5576 9.70667 22.2951 8.49 21.7701C7.27333 21.2451 6.215 20.5326 5.315 19.6326C4.415 18.7326 3.7025 17.6743 3.1775 16.4576C2.6525 15.241 2.39 13.941 2.39 12.5576C2.39 11.1743 2.6525 9.87428 3.1775 8.65762C3.7025 7.44095 4.415 6.38262 5.315 5.48262C6.215 4.58262 7.27333 3.87012 8.49 3.34512C9.70667 2.82012 11.0067 2.55762 12.39 2.55762C13.7733 2.55762 15.0733 2.82012 16.29 3.34512C17.5067 3.87012 18.565 4.58262 19.465 5.48262C20.365 6.38262 21.0775 7.44095 21.6025 8.65762C22.1275 9.87428 22.39 11.1743 22.39 12.5576C22.39 12.891 22.3733 13.2243 22.34 13.5576C22.3067 13.891 22.2567 14.2243 22.19 14.5576H20.14C20.2233 14.2243 20.2858 13.891 20.3275 13.5576C20.3692 13.2243 20.39 12.891 20.39 12.5576C20.39 12.2243 20.3692 11.891 20.3275 11.5576C20.2858 11.2243 20.2233 10.891 20.14 10.5576H16.74C16.79 10.891 16.8275 11.2243 16.8525 11.5576C16.8775 11.891 16.89 12.2243 16.89 12.5576C16.89 12.891 16.8775 13.2243 16.8525 13.5576C16.8275 13.891 16.79 14.2243 16.74 14.5576H14.74C14.79 14.2243 14.8275 13.891 14.8525 13.5576C14.8775 13.2243 14.89 12.891 14.89 12.5576C14.89 12.2243 14.8775 11.891 14.8525 11.5576C14.8275 11.2243 14.79 10.891 14.74 10.5576H10.04C9.99 10.891 9.9525 11.2243 9.9275 11.5576C9.9025 11.891 9.89 12.2243 9.89 12.5576C9.89 12.891 9.9025 13.2243 9.9275 13.5576C9.9525 13.891 9.99 14.2243 10.04 14.5576H13.39V16.5576H10.49C10.69 17.2743 10.9483 17.9618 11.265 18.6201C11.5817 19.2785 11.9567 19.9076 12.39 20.5076C12.7233 20.5076 13.0567 20.4868 13.39 20.4451C13.7233 20.4035 14.0567 20.3659 14.39 20.3326V22.3826C14.0567 22.416 13.7233 22.4535 13.39 22.4951C13.0567 22.5368 12.7233 22.5576 12.39 22.5576ZM4.64 14.5576H8.04C7.99 14.2243 7.9525 13.891 7.9275 13.5576C7.9025 13.2243 7.89 12.891 7.89 12.5576C7.89 12.2243 7.9025 11.891 7.9275 11.5576C7.9525 11.2243 7.99 10.891 8.04 10.5576H4.64C4.55667 10.891 4.49417 11.2243 4.4525 11.5576C4.41083 11.891 4.39 12.2243 4.39 12.5576C4.39 12.891 4.41083 13.2243 4.4525 13.5576C4.49417 13.891 4.55667 14.2243 4.64 14.5576ZM5.49 8.55762H8.44C8.59 7.94095 8.7775 7.33678 9.0025 6.74512C9.2275 6.15345 9.49 5.57428 9.79 5.00762C8.87333 5.30762 8.04833 5.76178 7.315 6.37012C6.58167 6.97845 5.97333 7.70762 5.49 8.55762ZM9.79 20.1076C9.49 19.541 9.2275 18.9618 9.0025 18.3701C8.7775 17.7785 8.59 17.1743 8.44 16.5576H5.49C5.97333 17.4076 6.58167 18.1368 7.315 18.7451C8.04833 19.3535 8.87333 19.8076 9.79 20.1076ZM10.49 8.55762H14.29C14.09 7.84095 13.8317 7.15345 13.515 6.49512C13.1983 5.83678 12.8233 5.20762 12.39 4.60762C11.9567 5.20762 11.5817 5.83678 11.265 6.49512C10.9483 7.15345 10.69 7.84095 10.49 8.55762ZM16.34 8.55762H19.29C18.8067 7.70762 18.1983 6.97845 17.465 6.37012C16.7317 5.76178 15.9067 5.30762 14.99 5.00762C15.29 5.57428 15.5525 6.15345 15.7775 6.74512C16.0025 7.33678 16.19 7.94095 16.34 8.55762Z"
                  fill="#1EBBB8"
                />
              </svg>
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-sm font-medium text-gray-500">
                Website Views
              </h3>
              <p className="text-2xl font-semibold text-gray-800">
                {stats.websiteViews}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="bg-green-50 p-3 rounded-full">
              <svg
                className="w-7 h-7 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-sm font-medium text-gray-500">Card Scans</h3>
              <p className="text-2xl font-semibold text-gray-800">
                {stats.scans}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="bg-blue-50 p-3 rounded-full">
              <svg
                className="w-7 h-7 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-sm font-medium text-gray-500">Downloads</h3>
              <p className="text-2xl font-semibold text-gray-800">
                {stats.downloads}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity List */}
      <Card className="p-0">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="text-left">
              <h2 className="text-xl font-semibold">Activity Log</h2>
              <p className="text-gray-500 text-sm">
                {activities.length} activities found
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-2 text-sm rounded-l-md text-left ${
                    filter === "all"
                      ? "bg-primary-500 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("scan")}
                  className={`px-3 py-2 text-sm text-left ${
                    filter === "scan"
                      ? "bg-primary-500 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Scans
                </button>
                <button
                  onClick={() => setFilter("website view")}
                  className={`px-3 py-2 text-sm text-left ${
                    filter === "website view"
                      ? "bg-primary-500 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Website
                </button>
                <button
                  onClick={() => setFilter("download")}
                  className={`px-3 py-2 text-sm rounded-r-md text-left ${
                    filter === "download"
                      ? "bg-primary-500 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Downloads
                </button>
              </div>

              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="block w-full sm:w-auto text-sm py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-left"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {isLoadingActivities ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : activities.length > 0 ? (
          <div className="border-t border-gray-100">
            {activities.map((activity, index) => (
              <ActivityItem key={activity._id || index} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="py-16 px-4 text-left">
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No activities found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter !== "all"
                ? `No ${filter} activities in the selected time period.`
                : "No activity has been recorded yet."}
            </p>
          </div>
        )}

        {activities.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center text-left">
            <p className="text-sm text-gray-500">
              Showing {activities.length} of {stats.total} activities
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Activity;
