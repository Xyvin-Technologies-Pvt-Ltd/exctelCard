import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";
import React from "react";
import Card from "../components/Card";

/**
 * Generate PDF business card using the Card component
 * This ensures perfect design consistency with the frontend
 */
export const generateBusinessCardPDF = async (profile, shareUrl) => {
  try {
    // Create a temporary container for rendering the card
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "-9999px";
    tempContainer.style.width = "250px"; // Portrait width
    tempContainer.style.height = "400px"; // Portrait height
    tempContainer.style.backgroundColor = "#ffffff";
    document.body.appendChild(tempContainer);

    // Create React root and render the card
    const root = createRoot(tempContainer);

    // Render the card component
    root.render(
      React.createElement(Card, {
        user: {
          name: profile.name,
          title: profile.jobTitle,
          email: profile.email,
          phone: profile.phone,
          phone2: profile.phone2,
          address: profile.address,
        },
        qrCodeData: shareUrl || window.location.href,
        isFlippable: false, // Don't make it flippable for PDF generation
      })
    );

    // Wait for the component to render and images to load
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate canvas from the front side
    const frontCanvas = await html2canvas(tempContainer, {
      width: 250,
      height: 400,
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false, // Disable console logging
    });

    // Create a new container for the back side
    const backContainer = document.createElement("div");
    backContainer.style.position = "absolute";
    backContainer.style.left = "-9999px";
    backContainer.style.top = "-9999px";
    backContainer.style.width = "250px";
    backContainer.style.height = "400px";
    backContainer.style.backgroundColor = "#ffffff";
    document.body.appendChild(backContainer);

    // Create React root for back side
    const backRoot = createRoot(backContainer);

    // Render the card component
    backRoot.render(
      React.createElement(Card, {
        user: {
          name: profile.name,
          title: profile.jobTitle,
          email: profile.email,
          phone: profile.phone,
          phone2: profile.phone2,
          address: profile.address,
        },
        qrCodeData: shareUrl || window.location.href,
        isFlippable: false,
      })
    );

    // Wait for initial render
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Force the card to show the back side by adding the flipped class
    const cardElement = backContainer.querySelector(".card-flip-container");
    if (cardElement) {
      cardElement.classList.add("is-flipped");
    }

    // Wait for the back side to render
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate canvas from the back side
    const backCanvas = await html2canvas(backContainer, {
      width: 250,
      height: 400,
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false, // Disable console logging
    });

    // Create PDF document
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [53.98, 85.6], // Standard business card size (width x height for portrait)
    });

    // Add front side
    const frontImgData = frontCanvas.toDataURL("image/png");
    pdf.addImage(frontImgData, "PNG", 0, 0, 53.98, 85.6);

    // Add back side on a new page
    pdf.addPage();
    const backImgData = backCanvas.toDataURL("image/png");
    pdf.addImage(backImgData, "PNG", 0, 0, 53.98, 85.6);

    // Clean up temporary elements
    root.unmount();
    backRoot.unmount();
    document.body.removeChild(tempContainer);
    document.body.removeChild(backContainer);

    // Generate and download the PDF
    const fileName = `${
      profile.name?.toLowerCase().replace(/\s+/g, "_") || "business_card"
    }.pdf`;
    pdf.save(fileName);

    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

/**
 * Alternative method: Generate PDF with both sides on one page
 * This creates a single page with front and back side by side
 */
export const generateBusinessCardPDFSinglePage = async (profile, shareUrl) => {
  try {
    // Create a temporary container for rendering both sides
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "-9999px";
    tempContainer.style.width = "500px"; // Double width for both sides in portrait
    tempContainer.style.height = "400px";
    tempContainer.style.backgroundColor = "#ffffff";
    tempContainer.style.display = "flex";
    tempContainer.style.gap = "20px";
    document.body.appendChild(tempContainer);

    // Create React root
    const root = createRoot(tempContainer);

    // Render both card sides side by side
    root.render(
      React.createElement("div", { style: { display: "flex", gap: "20px" } }, [
        // Front side
        React.createElement(Card, {
          key: "front",
          user: {
            name: profile.name,
            title: profile.jobTitle,
            email: profile.email,
            phone: profile.phone,
            phone2: profile.phone2,
            address: profile.address,
          },
          qrCodeData: shareUrl || window.location.href,
          isFlippable: false,
        }),
        // Back side (manually flipped)
        React.createElement(
          "div",
          {
            key: "back",
            style: { transform: "scaleX(-1)" }, // Flip horizontally to show back
          },
          React.createElement(Card, {
            user: {
              name: profile.name,
              title: profile.jobTitle,
              email: profile.email,
              phone: profile.phone,
              phone2: profile.phone2,
              address: profile.address,
            },
            qrCodeData: shareUrl || window.location.href,
            isFlippable: false,
          })
        ),
      ])
    );

    // Wait for rendering
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate canvas
    const canvas = await html2canvas(tempContainer, {
      width: 500,
      height: 400,
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    // Create PDF document
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [53.98, 85.6],
    });

    // Add the combined image
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, 53.98, 85.6);

    // Clean up
    root.unmount();
    document.body.removeChild(tempContainer);

    // Download
    const fileName = `${
      profile.name?.toLowerCase().replace(/\s+/g, "_") || "business_card"
    }.pdf`;
    pdf.save(fileName);

    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
