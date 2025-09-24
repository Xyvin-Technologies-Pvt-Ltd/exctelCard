import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import "../styles/CardFlip.css";
import { BsMicrosoftTeams } from "react-icons/bs";
import { RiWhatsappFill } from "react-icons/ri";
import { FaMobileAlt } from "react-icons/fa";

const Card = ({ user, qrCodeData, isFlippable }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    if (isFlippable) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div
      className={`card-flip-container ${isFlipped ? "is-flipped" : ""} ${
        isFlippable ? "is-flippable" : ""
      }`}
      onClick={handleFlip}
      style={{ cursor: isFlippable ? "pointer" : "default" }}
    >
      <div className="card-flip">
        {/* Front Side */}

        <div className="business-card-side business-card-front relative h-full">
          {/* Card Front Background Image */}
          <img
            src="/cardback.jpg"
            alt="Card Front"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col h-full p-4 ml-6">
            {/* Name and Title - positioned absolutely based on the card design */}
            <div className="absolute top-[130px] left-4">
              <h2 className="text-lg md:text-xl font-aktiv-bold text-gray-900 font-aktiv">
                {user?.name || "NOWSHAD HAMEED"}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 font-aktiv-bold">
                {user?.title || "Chief Executive Officer"}
              </p>
            </div>

            {/* Contact Information - positioned absolutely with tighter spacing */}
            <div className="absolute top-[220px] left-4 space-y-1">
              <div className="flex items-center text-xs md:text-sm text-gray-700 font-aktiv-bold">
                <Mail size={12} className="mr-2 text-gray-600 flex-shrink-0" />
                <BsMicrosoftTeams size={12} className="mr-2 text-gray-600 flex-shrink-0" />
                <span>{user?.email || "nowshad.hameed@exctel.com"}</span>
              </div>
              <div className="flex items-center text-xs md:text-sm text-gray-700 font-aktiv-bold">
                <FaMobileAlt size={12} className="mr-2 text-gray-600 flex-shrink-0" />
                <RiWhatsappFill size={12} className="mr-2 text-gray-600 flex-shrink-0" />
                <span>{user?.phone || "+65 9027 7225"}</span>
              </div>
              {user?.phone2 && (
                <div className="flex items-center text-xs md:text-sm text-gray-700 font-aktiv-bold">
                  <Phone
                    size={12}
                    className="mr-2 text-gray-600 flex-shrink-0"
                  />
                  <span>{user.phone2}</span>
                </div>
              )}
              <div className="flex items-start text-xs md:text-sm text-gray-700 font-aktiv-bold">
                <div className="w-5 h-2"></div>
                <MapPin
                  size={12}
                  className="mr-2 text-gray-600 flex-shrink-0 mt-0.5"
                />
                <span className="whitespace-pre-line">
                  {user?.address ||
                    "7791 Jalan Bukit Merah\n#06-14 E-Centre @ Redhill\nSingapore 159471"}
                </span>
              </div>
              <div className="flex items-center text-xs md:text-sm pt-4 text-gray-700 font-aktiv-bold">
              <div className="w-5 h-2"></div>

                <Globe size={12} className="mr-2 text-gray-600 flex-shrink-0 ma" />
                <span>www.exctel.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className="business-card-side business-card-back relative h-full">
          {/* Card Back Background Image */}
          <img
            src="/cardfront.jpg"
            alt="Card Back"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* QR Code Overlay - positioned absolutely */}
          <div className="absolute bottom-5 md:bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-white bg-opacity-90 p-1 md:p-2 rounded-lg">
              {/* Mobile QR Code */}
              <div className="block md:hidden">
                <QRCodeSVG
                  value={qrCodeData || "https://www.exctel.com"}
                  size={80}
                  includeMargin={true}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  level="H"
                />
              </div>
              {/* Desktop QR Code */}
              <div className="hidden md:block">
                <QRCodeSVG
                  value={qrCodeData || "https://www.exctel.com"}
                  size={100}
                  includeMargin={true}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  level="H"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
