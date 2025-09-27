import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";
import React from "react";
import BusinessCardPDFLayout from "../components/BusinessCardPDFLayout";

/**
 * Generate PDF business card using dedicated PDF layout component
 */
export const generateBusinessCardPDF = async (profile, shareUrl) => {
  try {
    // Create a temporary container for rendering both sides
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "-9999px";
    tempContainer.style.width = "540px"; // Wide enough for both cards + gap
    tempContainer.style.height = "420px"; // Height + some padding
    tempContainer.style.backgroundColor = "#ffffff";
    document.body.appendChild(tempContainer);

    // Create React root and render the PDF layout
    const root = createRoot(tempContainer);

    // Render both sides using the dedicated PDF layout component
    root.render(
      React.createElement(BusinessCardPDFLayout, {
        user: {
          name: profile.name,
          title: profile.jobTitle,
          email: profile.email,
          phone: profile.phone,
          phone2: profile.phone2,
          address: profile.address,
        },
        qrCodeData: shareUrl || window.location.href,
      })
    );

    // Wait for the component to render and images to load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate canvas from the rendered layout
    const canvas = await html2canvas(tempContainer, {
      width: 540,
      height: 420,
      scale: 3, // Higher resolution for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    // Create PDF document - landscape to fit both cards
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4", // Standard A4 paper
    });

    // Calculate dimensions to fit both cards nicely on A4
    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate scale to fit the image properly
    const canvasAspectRatio = canvas.width / canvas.height;
    const pdfAspectRatio = pdfWidth / pdfHeight;

    let finalWidth, finalHeight;
    if (canvasAspectRatio > pdfAspectRatio) {
      // Canvas is wider relative to its height
      finalWidth = pdfWidth - 20; // 10mm margin on each side
      finalHeight = finalWidth / canvasAspectRatio;
    } else {
      // Canvas is taller relative to its width
      finalHeight = pdfHeight - 20; // 10mm margin on top/bottom
      finalWidth = finalHeight * canvasAspectRatio;
    }

    // Center the image
    const x = (pdfWidth - finalWidth) / 2;
    const y = (pdfHeight - finalHeight) / 2;

    pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);

    // Clean up temporary elements
    root.unmount();
    document.body.removeChild(tempContainer);

    // Generate and download the PDF
    const fileName = `${
      profile.name?.toLowerCase().replace(/\s+/g, "_") || "business_card"
    }_both_sides.pdf`;
    pdf.save(fileName);

    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

/**
 * Generate PDF with front and back on separate pages
 */
export const generateBusinessCardPDFSeparatePages = async (
  profile,
  shareUrl
) => {
  try {
    // Create a temporary container for rendering both sides
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "-9999px";
    tempContainer.style.width = "540px";
    tempContainer.style.height = "420px";
    tempContainer.style.backgroundColor = "#ffffff";
    document.body.appendChild(tempContainer);

    // Create React root and render the PDF layout
    const root = createRoot(tempContainer);
    root.render(
      React.createElement(BusinessCardPDFLayout, {
        user: {
          name: profile.name,
          title: profile.jobTitle,
          email: profile.email,
          phone: profile.phone,
          phone2: profile.phone2,
          address: profile.address,
        },
        qrCodeData: shareUrl || window.location.href,
      })
    );

    // Wait for rendering
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate canvas
    const canvas = await html2canvas(tempContainer, {
      width: 540,
      height: 420,
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    // Create PDF document
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [53.98, 85.6], // Standard business card size
    });

    const imgData = canvas.toDataURL("image/png", 1.0);

    // Extract front side (left half of the canvas)
    const frontCanvas = document.createElement("canvas");
    const frontCtx = frontCanvas.getContext("2d");
    frontCanvas.width = canvas.width / 2;
    frontCanvas.height = canvas.height;

    const img = new Image();
    img.onload = () => {
      // Draw front side (left half)
      frontCtx.drawImage(
        img,
        0,
        0,
        canvas.width / 2,
        canvas.height,
        0,
        0,
        frontCanvas.width,
        frontCanvas.height
      );
      const frontImgData = frontCanvas.toDataURL("image/png", 1.0);
      pdf.addImage(frontImgData, "PNG", 0, 0, 53.98, 85.6);

      // Add new page for back side
      pdf.addPage();

      // Extract back side (right half of the canvas)
      const backCanvas = document.createElement("canvas");
      const backCtx = backCanvas.getContext("2d");
      backCanvas.width = canvas.width / 2;
      backCanvas.height = canvas.height;

      backCtx.drawImage(
        img,
        canvas.width / 2,
        0,
        canvas.width / 2,
        canvas.height,
        0,
        0,
        backCanvas.width,
        backCanvas.height
      );
      const backImgData = backCanvas.toDataURL("image/png", 1.0);
      pdf.addImage(backImgData, "PNG", 0, 0, 53.98, 85.6);

      // Clean up and save
      root.unmount();
      document.body.removeChild(tempContainer);

      const fileName = `${
        profile.name?.toLowerCase().replace(/\s+/g, "_") || "business_card"
      }_separate_pages.pdf`;
      pdf.save(fileName);
    };

    img.src = imgData;

    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
