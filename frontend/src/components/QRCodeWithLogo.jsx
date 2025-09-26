import React, { useRef, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const QRCodeWithLogo = ({
  value,
  size = 200,
  logoSize = 40,
  logoPath = "/logo.png",
  level = "H",
  includeMargin = true,
  bgColor = "#FFFFFF",
  fgColor = "#000000",
  className = "",
  frameStyle = "none", // "none", "round", "square", "custom", "curved-corner"
  frameColor = "#000000",
  frameWidth = 2,
  frameRadius = 4,
  frameGradient = null, // For gradient frames
  ...props
}) => {
  const qrRef = useRef(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Calculate optimal logo size (max 25% of QR code size for readability)
  const maxLogoSize = Math.min(logoSize, size * 0.25);
  const actualLogoSize = Math.min(maxLogoSize, logoSize);

  // Frame styling based on frameStyle prop
  const getFrameStyles = () => {
    const baseStyles = {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: 1,
    };

    switch (frameStyle) {
      case "round":
        return {
          ...baseStyles,
          borderRadius: "50%",
          border: `${frameWidth}px solid ${frameColor}`,
          boxShadow: `0 0 0 ${frameWidth}px ${frameColor}`,
        };
      case "square":
        return {
          ...baseStyles,
          borderRadius: "0px",
          border: `${frameWidth}px solid ${frameColor}`,
        };
      case "custom":
        return {
          ...baseStyles,
          borderRadius: `${frameRadius}px`,
          border: `${frameWidth}px solid ${frameColor}`,
        };
      case "gradient":
        return {
          ...baseStyles,
          borderRadius:
            frameGradient?.type === "round" ? "50%" : `${frameRadius}px`,
          background:
            frameGradient?.colors ||
            `linear-gradient(45deg, ${frameColor}, ${frameColor}88)`,
          padding: `${frameWidth}px`,
        };
      case "curved-corner":
        // For curved-corner, we don't use this function - corners are rendered separately
        return {
          ...baseStyles,
          border: "none",
        };
      default:
        return null;
    }
  };

  // Corner styles for curved-corner frame
  const getCornerStyles = () => {
    // Calculate corner size based on QR code size (proportional)
    const cornerSize = Math.max(size * 0.15, 30); // At least 30px, or 15% of QR size
    const borderRadius = Math.max(cornerSize * 0.3, 8); // Proportional radius
    
    return {
      position: "absolute",
      width: `${cornerSize}px`,
      height: `${cornerSize}px`,
      border: `${frameWidth}px solid ${frameColor}`,
      zIndex: 2,
    };
  };

  // Preload the logo image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setLogoLoaded(true);
      setLogoError(false);
    };
    img.onerror = () => {
      setLogoLoaded(false);
      setLogoError(true);
    };
    img.src = logoPath;
  }, [logoPath]);

  const cornerSize = Math.max(size * 0.15, 30);
  const borderRadius = Math.max(cornerSize * 0.3, 8);

  return (
    <div className={`relative inline-block ${className}`} {...props}>
      {/* QR Code */}
      <QRCodeSVG
        ref={qrRef}
        value={value}
        size={size}
        level={level}
        includeMargin={includeMargin}
        bgColor={bgColor}
        fgColor={fgColor}
      />

      {/* Custom Frame (for non-curved-corner styles) */}
      {frameStyle !== "none" && frameStyle !== "curved-corner" && (
        <div style={getFrameStyles()} />
      )}

      {/* Curved Corner Frame */}
      {frameStyle === "curved-corner" && (
        <>
          {/* Top-left corner */}
          <div
            style={{
              ...getCornerStyles(),
              top: 0,
              left: 0,
              borderRight: "none",
              borderBottom: "none",
              borderTopLeftRadius: `${borderRadius}px`,
            }}
          />
          
          {/* Top-right corner */}
          <div
            style={{
              ...getCornerStyles(),
              top: 0,
              right: 0,
              borderLeft: "none",
              borderBottom: "none",
              borderTopRightRadius: `${borderRadius}px`,
            }}
          />
          
          {/* Bottom-left corner */}
          <div
            style={{
              ...getCornerStyles(),
              bottom: 0,
              left: 0,
              borderRight: "none",
              borderTop: "none",
              borderBottomLeftRadius: `${borderRadius}px`,
            }}
          />
          
          {/* Bottom-right corner */}
          <div
            style={{
              ...getCornerStyles(),
              bottom: 0,
              right: 0,
              borderLeft: "none",
              borderTop: "none",
              borderBottomRightRadius: `${borderRadius}px`,
            }}
          />
        </>
      )}

      {/* Logo Overlay */}
      {logoLoaded && !logoError && (
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            width: actualLogoSize,
            height: actualLogoSize,
            backgroundColor: bgColor,
            borderRadius: className.includes("rounded-full") ? "50%" : "6px",
            padding: "2px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            border: "1px solid rgba(0,0,0,0.1)",
            zIndex: 3,
          }}
        >
          <img
            src={logoPath}
            alt="Company Logo"
            className="w-full h-full object-contain"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              borderRadius: className.includes("rounded-full") ? "50%" : "4px",
            }}
            onError={() => setLogoError(true)}
          />
        </div>
      )}

      {/* Fallback indicator if logo fails to load */}
      {logoError && (
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            width: actualLogoSize,
            height: actualLogoSize,
            backgroundColor: bgColor,
            borderRadius: className.includes("rounded-full") ? "50%" : "6px",
            padding: "2px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            border: "1px solid rgba(0,0,0,0.1)",
            zIndex: 3,
          }}
        >
          <div
            className="w-full h-full bg-gray-200 flex items-center justify-center"
            style={{
              borderRadius: className.includes("rounded-full") ? "50%" : "4px",
            }}
          >
            <span className="text-xs text-gray-500 font-medium">LOGO</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeWithLogo;