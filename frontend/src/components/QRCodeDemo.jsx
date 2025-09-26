import React, { useState } from "react";
import QRCodeWithLogo from "./QRCodeWithLogo";

const QRCodeDemo = () => {
  const [qrData, setQrData] = useState(
    "https://exctelcard.xyvin.com/share/demo"
  );
  const [size, setSize] = useState(200);
  const [logoSize, setLogoSize] = useState(45);
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [fgColor, setFgColor] = useState("#000000");

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">QR Code with Logo Demo</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QR Code Data
            </label>
            <input
              type="text"
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QR Size: {size}px
              </label>
              <input
                type="range"
                min="100"
                max="400"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Size: {logoSize}px
              </label>
              <input
                type="range"
                min="20"
                max="100"
                value={logoSize}
                onChange={(e) => setLogoSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foreground Color
              </label>
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Features:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Company logo overlay in center</li>
              <li>• High error correction level (H)</li>
              <li>• Customizable colors and sizes</li>
              <li>• Responsive design</li>
              <li>• Download as PNG/SVG</li>
            </ul>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="flex flex-col items-center">
          <div className="p-6 bg-white rounded-2xl shadow-lg border-2 border-gray-200 mb-4">
            <QRCodeWithLogo
              value={qrData}
              size={size}
              logoSize={logoSize}
              logoPath="/logo.png"
              level="H"
              includeMargin={true}
              bgColor={bgColor}
              fgColor={fgColor}
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Scan this QR code to test functionality
            </p>
            <div className="text-xs text-gray-500">
              Size: {size}×{size}px | Logo: {logoSize}×{logoSize}px
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDemo;

