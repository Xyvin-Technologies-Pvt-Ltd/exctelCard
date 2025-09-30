import api from "./index";
import toast from "react-hot-toast";



// Generate new QR code with logo
export const downloadQRBackEnd = async (shareId) => {
  try {
    const response = await api.get(`/qrcode/share/${shareId}`) 
    console.log(response.data);
    if(response.data.success){
      const link = document.createElement("a");
      link.href = response.data.url;
      link.download = `${response.data.user}-qr-code.png`;
      link.click();
    }
    toast.success("QR code generated successfully");
    return response.data;
  } catch (error) {
    console.error("Error generating QR code:", error);
    toast.error("Failed to generate QR code");
    throw error;
  }
};


