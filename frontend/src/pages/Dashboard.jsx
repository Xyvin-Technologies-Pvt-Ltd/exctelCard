import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { QRCodeSVG } from "qrcode.react";
import Card from "../components/Card";
import "../styles/CardFlip.css";
import { useAuthStore } from "../store/auth";
import { BRAND } from "../utils/constants";

// Sample static data
const staticUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 555-123-4567",
  company: "Example Corp",
  title: "Software Engineer",
};

const staticQRCodeData = "https://example.com/card/johndoe123";

const staticActivities = [
  {
    _id: "1",
    type: "scan",
    ipAddress: "192.168.1.1",
    timestamp: "2025-05-15T10:30:00Z",
  },
  {
    _id: "2",
    type: "download",
    ipAddress: "192.168.1.2",
    timestamp: "2025-05-14T14:45:00Z",
  },
  {
    _id: "3",
    type: "view",
    ipAddress: "192.168.1.3",
    timestamp: "2025-05-13T09:15:00Z",
  },
];

// StatsCard component
const StatsCard = ({ title, value, icon, bgColor }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
    <div className="flex items-center">
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-full ${bgColor}`}
      >
        {icon}
      </div>
      <div className="ml-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
);

// ActivityItem component
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
            aria-label="Scan icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
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
            aria-label="Download icon"
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
            aria-label="View icon"
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
      case "download":
        return "text-primary-500 bg-primary-50";
      default:
        return "text-accent-500 bg-accent-50";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
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
      <div className="ml-4 flex-grow">
        <p className="text-sm font-medium text-gray-800">
          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}{" "}
          activity
        </p>
        <p className="text-xs text-gray-500">From IP: {activity.ipAddress}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500">
          {formatDate(activity.timestamp)}
        </p>
      </div>
    </div>
  );
};

// Static helper functions
const getTotalScans = () => {
  return staticActivities.filter((activity) => activity.type === "scan").length;
};

const getRecentActivity = () => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return staticActivities.filter((activity) => {
    const activityDate = new Date(activity.timestamp);
    return activityDate > oneWeekAgo;
  }).length;
};

const getLastScanDate = () => {
  const lastScan = staticActivities.find((a) => a.type === "scan");
  return lastScan ? new Date(lastScan.timestamp).toLocaleDateString() : "Never";
};

const Dashboard = () => {
  const { user } = useAuthStore();

  // Dummy data for demonstration
  const cardStats = {
    views: 342,
    downloads: 28,
    shares: 15,
    qrScans: 89,
  };

  const recentActivity = [
    { type: "view", count: 12, time: "2 hours ago", icon: "👀" },
    { type: "download", count: 3, time: "5 hours ago", icon: "📥" },
    { type: "share", count: 1, time: "1 day ago", icon: "🔗" },
    { type: "qr_scan", count: 7, time: "2 days ago", icon: "📱" },
  ];

  const StatCard = ({ title, value, change, icon, color = "orange" }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {value.toLocaleString()}
          </p>
          {change && (
            <p
              className={`text-sm mt-2 ${
                change > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              <span className="font-medium">
                {change > 0 ? "+" : ""}
                {change}%
              </span>
              <span className="text-gray-500 ml-1">vs last week</span>
            </p>
          )}
        </div>
        <div
          className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}
        >
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({
    title,
    description,
    icon,
    onClick,
    color = "orange",
  }) => (
    <div
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        <div
          className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center group-hover:bg-${color}-200 transition-colors duration-200`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
        <svg
          className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transform -translate-x-24 translate-y-24"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-orange-100 text-lg">
                Your digital business card is performing great. Here's your
                overview.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-4xl font-bold text-white">E</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View My Card
            </Button>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
              Share Card
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Views"
          value={cardStats.views}
          change={12}
          icon="👀"
          color="blue"
        />
        <StatCard
          title="Downloads"
          value={cardStats.downloads}
          change={8}
          icon="📥"
          color="green"
        />
        <StatCard
          title="Shares"
          value={cardStats.shares}
          change={-3}
          icon="🔗"
          color="purple"
        />
        <StatCard
          title="QR Scans"
          value={cardStats.qrScans}
          change={15}
          icon="📱"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickActionCard
              title="Update Profile"
              description="Edit your business card information and contact details"
              icon={
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
              onClick={() => (window.location.href = "/profile")}
            />

            <QuickActionCard
              title="Download QR Code"
              description="Get your QR code for easy sharing and printing"
              icon={
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              }
              onClick={() => (window.location.href = "/qr-code")}
              color="blue"
            />

            <QuickActionCard
              title="View Analytics"
              description="See detailed insights about your card performance"
              icon={
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
              onClick={() => (window.location.href = "/activity")}
              color="green"
            />

            <QuickActionCard
              title="Share Your Card"
              description="Share your digital business card via link or social media"
              icon={
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              }
              onClick={() => (window.location.href = "/share")}
              color="purple"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recent Activity
          </h2>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">{activity.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {activity.count} {activity.type.replace("_", " ")}
                        {activity.count > 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-orange-600">
                      +{activity.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                onClick={() => (window.location.href = "/activity")}
              >
                View All Activity
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Card Preview Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Your Digital Card
          </h2>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Preview Card
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Card Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Company:</span>
                <span className="font-medium">Exctel</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="w-48 h-48 mx-auto bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-2xl">E</span>
                </div>
                <p className="text-orange-800 font-medium">
                  Digital Card Preview
                </p>
                <p className="text-orange-600 text-sm">
                  Click Preview to see full card
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
