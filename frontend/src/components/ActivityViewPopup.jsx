import React from "react";

const ActivityViewPopup = ({ isOpen, onClose, activityData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 m-0 p-0 min-h-screen w-screen">
      <div
        className="absolute inset-0 bg-black opacity-50 m-0 p-0"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-80">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Activity view</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-700">
            <span>Total Activity</span>
            <span className="font-medium">{activityData.total}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-700">
            <span>Website View</span>
            <span className="font-medium">{activityData.websiteView}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-700">
            <span>vCard Downloads</span>
            <span className="font-medium">{activityData.vcardDownloads}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-700">
            <span>Biz Card Downloads</span>
            <span className="font-medium">{activityData.cardDownloads}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityViewPopup;
