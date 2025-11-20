import React from "react";
import { Copy, Check, Loader2 } from "lucide-react";

/**
 * SignaturePreview component - Displays HTML signature preview
 */
const SignaturePreview = ({ html, isLoading, onCopy, copyState = "idle", title = "Signature Preview" }) => {
  const getCopyButtonContent = () => {
    switch (copyState) {
      case "pending":
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Copying...
          </>
        );
      case "success":
        return (
          <>
            <Check className="w-4 h-4" />
            Copied!
          </>
        );
      case "error":
        return (
          <>
            <Copy className="w-4 h-4" />
            Try Again
          </>
        );
      default:
        return (
          <>
            <Copy className="w-4 h-4" />
            Copy Signature
          </>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {onCopy && (
          <button
            onClick={onCopy}
            disabled={isLoading || copyState === "pending"}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              copyState === "success"
                ? "bg-green-600 text-white"
                : copyState === "error"
                ? "bg-red-600 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {getCopyButtonContent()}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">Generating preview...</span>
        </div>
      ) : html ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 overflow-auto">
          <div
            dangerouslySetInnerHTML={{ __html: html }}
            className="signature-preview"
          />
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No signature preview available</p>
        </div>
      )}
    </div>
  );
};

export default SignaturePreview;

