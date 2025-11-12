import React, { useState } from "react";
import { ExternalLink, AlertCircle, CheckCircle } from "lucide-react";

/**
 * ManifestDebugger component - Helps debug Outlook add-in manifest
 */
const ManifestDebugger = ({ manifestUrl, commandsUrl }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!manifestUrl) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="font-semibold text-yellow-900">Manifest Debugger</span>
        </div>
        <span className="text-sm text-yellow-700">
          {isExpanded ? "Hide" : "Show"} Debug Info
        </span>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <h4 className="font-semibold text-gray-900 mb-3">Validation Checklist</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Manifest URL is HTTPS: {manifestUrl.startsWith("https://") ? "✓" : "✗"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Commands URL is HTTPS: {commandsUrl?.startsWith("https://") ? "✓" : "✗"}</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <h4 className="font-semibold text-gray-900 mb-3">Test URLs</h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Manifest URL:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={manifestUrl}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm"
                  />
                  <a
                    href={manifestUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </a>
                </div>
              </div>
              {commandsUrl && (
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Commands URL:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={commandsUrl}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm"
                    />
                    <a
                      href={commandsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Installation Instructions</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Open Outlook Web (outlook.office365.com)</li>
              <li>Go to Settings → Mail → Add-ins</li>
              <li>Click "Add a custom add-in" → "Add from URL"</li>
              <li>Paste the manifest URL above</li>
              <li>Click "Add" to install</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManifestDebugger;

