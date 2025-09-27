import React from "react";
import QRCodeWithLogo from "./QRCodeWithLogo";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { BsMicrosoftTeams } from "react-icons/bs";
import { RiWhatsappFill } from "react-icons/ri";
import { FaMobileAlt } from "react-icons/fa";

const BusinessCardPDFLayout = ({ user, qrCodeData }) => {
  return (
    <div style={{ 
      display: "flex", 
      gap: "20px",
      backgroundColor: "#ffffff",
      padding: "10px"
    }}>
      {/* Front Side */}
      <div style={{
        width: "250px",
        height: "400px",
        position: "relative",
        border: "1px solid #e0e0e0"
      }}>
        {/* Card Front Background Image */}
        <img
          src="/cardback.jpg"
          alt="Card Front"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />

        {/* Content Overlay */}
        <div style={{
          position: "relative",
          zIndex: 10,
          height: "100%",
          padding: "16px",
          marginLeft: "24px"
        }}>
          {/* Name and Title */}
          <div style={{
            position: "absolute",
            top: "100px",
            left: "16px"
          }}>
            <h2 style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#111827",
              margin: 0,
              fontFamily: "Arial, sans-serif"
            }}>
              {user?.name || "NOWSHAD HAMEED"}
            </h2>
            <p style={{
              fontSize: "12px",
              color: "#4B5563",
              fontWeight: "bold",
              margin: "2px 0 0 0",
              fontFamily: "Arial, sans-serif"
            }}>
              {user?.title || "Chief Executive Officer"}
            </p>
          </div>

          {/* Contact Information */}
          <div style={{
            position: "absolute",
            top: "180px",
            left: "16px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              fontSize: "11px",
              color: "#374151",
              fontWeight: "bold",
              marginBottom: "3px",
              fontFamily: "Arial, sans-serif",
              flexWrap: "nowrap",
              minHeight: "14px"
            }}>
              <Mail size={10} style={{ marginRight: "4px", color: "#4B5563", flexShrink: 0 }} />
              <BsMicrosoftTeams size={10} style={{ marginRight: "4px", color: "#4B5563", flexShrink: 0 }} />
              <span style={{ flexShrink: 0 }}>{user?.email || "nowshad.hameed@exctel.com"}</span>
            </div>
            
            <div style={{
              display: "flex",
              alignItems: "center",
              fontSize: "11px",
              color: "#374151",
              fontWeight: "bold",
              marginBottom: "3px",
              fontFamily: "Arial, sans-serif",
              flexWrap: "nowrap",
              minHeight: "14px"
            }}>
              <FaMobileAlt size={10} style={{ marginRight: "4px", color: "#4B5563", flexShrink: 0 }} />
              <RiWhatsappFill size={10} style={{ marginRight: "4px", color: "#4B5563", flexShrink: 0 }} />
              <span style={{ flexShrink: 0 }}>{user?.phone || "+65 9027 7225"}</span>
            </div>
            
            {user?.phone2 && (
              <div style={{
                display: "flex",
                alignItems: "center",
                fontSize: "11px",
                color: "#374151",
                fontWeight: "bold",
                marginBottom: "3px",
                fontFamily: "Arial, sans-serif",
                flexWrap: "nowrap",
                minHeight: "14px"
              }}>
                <Phone size={10} style={{ marginRight: "4px", color: "#4B5563", flexShrink: 0 }} />
                <span style={{ flexShrink: 0 }}>{user.phone2}</span>
              </div>
            )}
            
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              fontSize: "11px",
              color: "#374151",
              fontWeight: "bold",
              marginBottom: "3px",
              fontFamily: "Arial, sans-serif",
              flexWrap: "nowrap"
            }}>
              <div style={{ width: "12px", flexShrink: 0 }}></div>
              <MapPin size={10} style={{ marginRight: "4px", color: "#4B5563", flexShrink: 0, marginTop: "1px" }} />
              <span style={{ whiteSpace: "pre-line", flexShrink: 0 }}>
                {user?.address ||
                  "7791 Jalan Bukit Merah\n#06-14 E-Centre @ Redhill\nSingapore 159471"}
              </span>
            </div>
            
            <div style={{
              display: "flex",
              alignItems: "center",
              fontSize: "11px",
              paddingTop: "12px",
              color: "#374151",
              fontWeight: "bold",
              fontFamily: "Arial, sans-serif",
              flexWrap: "nowrap",
              minHeight: "14px"
            }}>
              <div style={{ width: "12px", flexShrink: 0 }}></div>
              <Globe size={10} style={{ marginRight: "4px", color: "#4B5563", flexShrink: 0 }} />
              <span style={{ flexShrink: 0 }}>www.exctel.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Back Side */}
      <div style={{
        width: "250px",
        height: "400px",
        position: "relative",
        border: "1px solid #e0e0e0"
      }}>
        {/* Card Back Background Image */}
        <img
          src="/cardfront.jpg"
          alt="Card Back"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />

        {/* QR Code Overlay */}
        <div style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10
        }}>
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "6px",
            border: "2px solid white"
          }}>
            <QRCodeWithLogo
              value={qrCodeData || "https://www.exctel.com"}
              size={70}
              logoSize={30}
              logoPath="/logo.png"
              level="H"
              includeMargin={true}
              bgColor="#FFFFFF"
              fgColor="#443f3e"
              frameStyle="none"
              frameColor="#F69322"
              frameWidth={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCardPDFLayout;