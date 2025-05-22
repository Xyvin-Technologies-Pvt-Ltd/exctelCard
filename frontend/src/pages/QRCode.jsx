import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FaDownload, FaShareAlt, FaHistory } from 'react-icons/fa';

export default function QRCode() {
  const [activeTab, setActiveTab] = useState('manage');
  const [qrHistory] = useState([
    {
      id: 1,
      name: 'Business Card QR',
      created: '2024-01-15',
      scans: 156,
    },
    {
      id: 2,
      name: 'Portfolio QR',
      created: '2024-01-10',
      scans: 89,
    },
  ]);

  const downloadQR = () => {
    // Implementation for downloading QR code
    console.log('Downloading QR code...');
  };

  const shareQR = () => {
    // Implementation for sharing QR code
    console.log('Sharing QR code...');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              QR Code Management
            </h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('manage')}
              className={`${activeTab === 'manage'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Manage QR Codes
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`${activeTab === 'history'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              History
            </button>
          </nav>
        </div>

        {activeTab === 'manage' ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* QR Code Display */}
                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
                  <QRCodeSVG
                    value="https://exctel.com/card/example"
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                  <div className="mt-6 flex space-x-4">
                    <button
                      onClick={downloadQR}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      <FaDownload className="mr-2" />
                      Download
                    </button>
                    <button
                      onClick={shareQR}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      <FaShareAlt className="mr-2" />
                      Share
                    </button>
                  </div>
                </div>

                {/* QR Code Settings */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      QR Code Name
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      placeholder="Enter QR code name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Linked URL
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      placeholder="Enter URL"
                    />
                  </div>
                  <button className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                    Generate New QR Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {qrHistory.map((item) => (
                <li key={item.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaHistory className="text-gray-400 mr-4" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Created on {item.created}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {item.scans} scans
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}