import React from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import { QRCodeSVG } from "qrcode.react";
import Card from "../components/Card";
import "../styles/CardFlip.css";

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
        <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
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

const DashboardPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <section className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back,{" "}
          <span className="text-orange-500">{staticUser.name.split(" ")[0]}</span>
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your digital business card
        </p>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Scans"
          value={getTotalScans()}
          icon={
            <svg
              className="w-6 h-6 text-orange-500"
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
          }
          bgColor="bg-orange-50"
        />
        <StatsCard
          title="7-Day Activity"
          value={getRecentActivity()}
          icon={
            <svg
              className="w-6 h-6 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Chart icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1zm0 0V9a1 1 0 011-1h2a1 1 0 011 1v10m-6 0a1 1 0 001 1h2a1 1 0 001-1m0 0V5a1 1 0 011-1h2a1 1 0 011 1v14a1 1 0 01-1 1h-2a1 1 0 01-1-1z"
              />
            </svg>
          }
          bgColor="bg-green-50"
        />
        <StatsCard
          title="Downloads"
          value={staticActivities.filter((activity) => activity.type === "download").length}
          icon={
            <svg
              className="w-6 h-6 text-blue-500"
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
          }
          bgColor="bg-blue-50"
        />
        <StatsCard
          title="Last Scan"
          value={getLastScanDate()}
          icon={
            <svg
              className="w-6 h-6 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Clock icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          bgColor="bg-yellow-50"
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Card Preview */}
        <section className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md border border-gray-100 p-8 md:p-12">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Your Digital Business Card
                </h2>
                <p className="text-gray-500 text-sm">
                  Preview of your digital business card
                </p>
              </div>
              <Link
                to="/profile"
                className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Customize icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Customize Card
              </Link>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full max-w-sm mb-6">
                <Card
                  user={staticUser}
                  qrCodeData={staticQRCodeData}
                  isFlippable={true}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm px-0">
                <Button
                  variant="outline"
                  className="flex-1 flex items-center justify-center py-2"
                  onClick={() => document.querySelector('.card-flip-container').click()}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Flip icon"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m-12 5h12m-12 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  Flip Card
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 flex items-center justify-center  text-orange-600 bg-orange-100 hover:bg-orange-200 px-0"
               
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 flex items-center justify-center py-2 px-0"
                
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Copy icon"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy Link
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* QR Code Section */}
        <section className="bg-white rounded-lg shadow-md border border-gray-100 p-8 lg:col-span-1">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 mt-4">Your QR Code</h2>
            <div className="space-y-4">
              <div className="flex justify-center p-4 bg-white rounded-lg border border-gray-200 mt-10">
                <QRCodeSVG
                  id="qr-canvas"
                  value={staticQRCodeData}
                  size={180}
                  includeMargin={true}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  level="H"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-28">
                <Button
                  variant="primary"
                  className="flex-1 flex items-center justify-center py-2 text-orange-600 bg-orange-100 hover:bg-orange-200"
           
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 flex items-center justify-center py-2"
        
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Copy icon"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy Link
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-6">
                Share your QR code on your business cards, email signature, or social media.
              </p>
            </div>
          </div>
        </section>

        {/* Activity Feed */}
        <section className="bg-white rounded-lg shadow-md border border-gray-100 p-8 lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <p className="text-gray-500 text-sm">
                Your card's recent interactions
              </p>
            </div>
            <Link
              to="/activity"
              className="inline-flex items-center text-sm font-medium text-orange-500 hover:text-orange-600"
            >
              View All
              <svg
                className="ml-1 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Chevron right"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          <div className="border rounded-lg overflow-hidden">
            {staticActivities.slice(0, 5).map((activity) => (
              <ActivityItem key={activity._id} activity={activity} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;