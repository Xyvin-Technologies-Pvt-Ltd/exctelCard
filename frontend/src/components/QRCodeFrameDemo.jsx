import React, { useState } from "react";
import QRCodeWithLogo from "./QRCodeWithLogo";

const QRCodeFrameDemo = () => {
  const [qrData, setQrData] = useState(
    "https://exctelcard.xyvin.com/share/demo"
  );
  const [frameStyle, setFrameStyle] = useState("round");
  const [frameColor, setFrameColor] = useState("#000000");
  const [frameWidth, setFrameWidth] = useState(4);
  const [frameRadius, setFrameRadius] = useState(8);

  const frameOptions = [
    { value: "none", label: "No Frame" },
    { value: "round", label: "Round Frame" },
    { value: "square", label: "Square Frame" },
    { value: "custom", label: "Custom Radius" },
    { value: "gradient", label: "Gradient Frame" },
  ];

  const gradientOptions = [
    {
      type: "round",
      colors: "linear-gradient(45deg, #ff6b6b, #4ecdc4)",
      label: "Round Gradient",
    },
    {
      type: "square",
      colors: "linear-gradient(135deg, #667eea, #764ba2)",
      label: "Square Gradient",
    },
    {
      type: "custom",
      colors: "linear-gradient(90deg, #f093fb, #f5576c)",
      label: "Custom Gradient",
    },
  ];

  const [selectedGradient, setSelectedGradient] = useState(gradientOptions[0]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8 text-center">
        QR Code Frame Styles Demo
      </h2>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frame Style
            </label>
            <select
              value={frameStyle}
              onChange={(e) => setFrameStyle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {frameOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {frameStyle === "gradient" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gradient Style
              </label>
              <select
                value={selectedGradient.type}
                onChange={(e) => {
                  const gradient = gradientOptions.find(
                    (g) => g.type === e.target.value
                  );
                  setSelectedGradient(gradient);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {gradientOptions.map((option) => (
                  <option key={option.type} value={option.type}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {frameStyle !== "none" && frameStyle !== "gradient" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frame Color
                </label>
                <input
                  type="color"
                  value={frameColor}
                  onChange={(e) => setFrameColor(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frame Width: {frameWidth}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={frameWidth}
                  onChange={(e) => setFrameWidth(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {frameStyle === "custom" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Border Radius: {frameRadius}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={frameRadius}
                    onChange={(e) => setFrameRadius(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </>
          )}

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Frame Options:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                • <strong>Round:</strong> Perfect circular frame
              </li>
              <li>
                • <strong>Square:</strong> Sharp rectangular frame
              </li>
              <li>
                • <strong>Custom:</strong> Adjustable border radius
              </li>
              <li>
                • <strong>Gradient:</strong> Beautiful gradient frames
              </li>
              <li>
                • <strong>None:</strong> No frame, just QR code
              </li>
            </ul>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="flex flex-col items-center">
          <div className="p-8 bg-white rounded-2xl shadow-lg border-2 border-gray-200 mb-4">
            <QRCodeWithLogo
              value={qrData}
              size={200}
              logoSize={50}
              logoPath="/logo.png"
              level="H"
              includeMargin={true}
              bgColor="#FFFFFF"
              fgColor="#000000"
              frameStyle={frameStyle}
              frameColor={frameColor}
              frameWidth={frameWidth}
              frameRadius={frameRadius}
              frameGradient={
                frameStyle === "gradient" ? selectedGradient : null
              }
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              {frameOptions.find((f) => f.value === frameStyle)?.label} Frame
            </p>
            <div className="text-xs text-gray-500">
              Size: 200×200px | Logo: 50×50px
            </div>
          </div>
        </div>
      </div>

      {/* Frame Examples Grid */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-6 text-center">
          All Frame Styles
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {frameOptions.map((option) => (
            <div key={option.value} className="text-center">
              <div className="p-4 bg-white rounded-lg shadow border border-gray-200 mb-2">
                <QRCodeWithLogo
                  value="https://exctel.com"
                  size={120}
                  logoSize={30}
                  logoPath="/logo.png"
                  level="H"
                  includeMargin={true}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  frameStyle={option.value}
                  frameColor="#000000"
                  frameWidth={3}
                  frameRadius={8}
                  frameGradient={
                    option.value === "gradient" ? gradientOptions[0] : null
                  }
                />
              </div>
              <p className="text-xs text-gray-600">{option.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QRCodeFrameDemo;



