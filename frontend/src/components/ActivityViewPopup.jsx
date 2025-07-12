import React from "react";
import { Button } from "../ui/Button";

const ActivityViewPopup = ({ isOpen, onClose, activity }) => {
  if (!isOpen || !activity) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Activity Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {activity && (
          <div className="space-y-4">
            {/* Activity Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">
                Activity Summary
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Total Activities:</span>
                  <p className="font-medium">{activity.total || 0}</p>
                </div>
                <div>
                  <span className="text-gray-500">Website Views:</span>
                  <p className="font-medium">{activity.websiteView || 0}</p>
                </div>
                <div>
                  <span className="text-gray-500">Card Scans:</span>
                  <p className="font-medium">{activity.cardScan || 0}</p>
                </div>
                <div>
                  <span className="text-gray-500">Downloads:</span>
                  <p className="font-medium">{activity.cardDownloads || 0}</p>
                </div>
              </div>
            </div>

            {/* Activity Breakdown */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-800">Activity Breakdown</h3>

              {/* Website Views */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Website Views
                  </span>
                </div>
                <span className="text-sm font-semibold text-blue-600">
                  {activity.websiteView || 0}
                </span>
              </div>

              {/* Card Scans */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-green-600"
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
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    QR Code Scans
                  </span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {activity.cardScan || 0}
                </span>
              </div>

              {/* Downloads */}
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Card Downloads
                  </span>
                </div>
                <span className="text-sm font-semibold text-orange-600">
                  {activity.cardDownloads || 0}
                </span>
              </div>
            </div>

            {/* Engagement Score */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">
                Engagement Score
              </h3>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((activity.total || 0) * 4, 100)}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-orange-600">
                  {Math.min((activity.total || 0) * 4, 100)}%
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Based on total interactions and engagement patterns
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="secondary" className="px-6">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActivityViewPopup;
