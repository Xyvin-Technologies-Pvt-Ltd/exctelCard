import { pdf } from "@react-pdf/renderer";
import React from "react";
import BusinessCardPDFDocument from "../components/BusinessCardPDFDocument";

/**
 * Convert image URL to base64 data URL
 */
const imageToBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      resolve(dataUrl);
    };
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Generate icon images for PDF using the same Icons8 icons as email signature
 */
const generateIconImages = async () => {
  // Use the same Icons8 URLs as in the email signature
  const iconUrls = {
    email: "https://img.icons8.com/?size=100&id=blLagk1rxZGp&format=png&color=000000",
    mobile: "https://img.icons8.com/?size=100&id=11471&format=png&color=000000",
    phone: "https://img.icons8.com/?size=200&id=pjumbCENHfje&format=png&color=000000",
    mapPin: "https://img.icons8.com/ios-filled/50/000000/marker.png",
    globe: "https://img.icons8.com/ios-filled/50/000000/globe.png",
  };
  
  const iconImages = {};
  for (const [key, url] of Object.entries(iconUrls)) {
    try {
      iconImages[key] = await imageToBase64(url);
    } catch (error) {
      console.warn(`Failed to load ${key} icon from Icons8:`, error);
      iconImages[key] = null;
    }
  }
  
  return iconImages;
};

/**
 * Generate QR code as base64 image with logo
 */
const generateQRCodeImage = async (data, size = 70) => {
  try {
    // Try to get QR code from backend API first (if shareId is available)
    if (data.includes('/share/')) {
      const shareIdMatch = data.match(/\/share\/([^/?]+)/);
      if (shareIdMatch) {
        try {
          const response = await fetch(`/api/qrcode/share/${shareIdMatch[1]}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data?.qrCode) {
              return result.data.qrCode; // Already base64 data URL
            }
          }
        } catch (apiError) {
          console.warn("Backend QR code API failed, using client-side generation:", apiError);
        }
      }
    }

    // Fallback: Generate QR code client-side
    const QRCode = (await import("qrcode")).default;
    const qrDataUrl = await QRCode.toDataURL(data, {
      width: size,
      margin: 1,
      color: {
        dark: "#443f3e",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    });
    
    // Add logo to QR code if possible
    try {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = qrDataUrl;
      });
      
      ctx.drawImage(img, 0, 0, size, size);
      
      // Try to add logo in center
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      try {
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve;
          logoImg.onerror = reject;
          logoImg.src = "/logo.png";
        });
        
        const logoSize = size * 0.3;
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;
        
        // White background for logo
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4);
        
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      } catch (logoError) {
        console.warn("Could not add logo to QR code:", logoError);
      }
      
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.warn("Error adding logo to QR code, using plain QR:", error);
      return qrDataUrl;
    }
  } catch (error) {
    console.error("Error generating QR code:", error);
    return null;
  }
};

/**
 * Generate PDF with front and back on separate pages using @react-pdf/renderer
 */
export const generateBusinessCardPDFSeparatePages = async (
  profile,
  shareUrl
) => {
  try {
    // Convert images to base64 for @react-pdf/renderer
    const cardBackImage = await imageToBase64("/cardback.jpg").catch(() => null);
    const cardFrontImage = await imageToBase64("/cardfront.jpg").catch(() => null);
    
    // Generate QR code as image
    const qrCodeImage = await generateQRCodeImage(
      shareUrl || window.location.href,
      70
    );

    // Generate icon images
    const iconImages = await generateIconImages();

    // Create PDF document using @react-pdf/renderer
    const doc = React.createElement(BusinessCardPDFDocument, {
      user: {
        name: profile.name,
        title: profile.jobTitle,
        email: profile.email,
        phone: profile.phone,
        phone2: profile.phone2,
        address: profile.address,
      },
      qrCodeData: shareUrl || window.location.href,
      cardBackImage: cardBackImage,
      cardFrontImage: cardFrontImage,
      qrCodeImage: qrCodeImage,
      iconImages: iconImages,
    });

    // Generate PDF blob
    const blob = await pdf(doc).toBlob();

    // Download the PDF
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = `${
      profile.name?.toLowerCase().replace(/\s+/g, "_") || "business_card"
    }_separate_pages.pdf`;
    
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
