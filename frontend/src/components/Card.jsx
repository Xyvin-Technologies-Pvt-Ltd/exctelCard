import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import "../styles/CardFlip.css";

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
      style={{ cursor: isFlippable ? 'pointer' : 'default' }}
    >
      <div className="card-flip">
        {/* Front Side */}
        
        <div className="business-card-side business-card-front relative bg-white h-full flex flex-col ">
          {/* Background Pattern */}
          {/* <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-20" /> */}
          {/* <div className="absolute top-0 right-0 w-32 h-32 bg-red from-orange-100 to-transparent opacity-200 transform rotate-45" /> */}
          <div
          className="absolute h-full w-full bg-[#f0f1f1]"
          style={{
            clipPath:
              "polygon(-10% 0%, 40% 0%, 80% 50%, 40% 100%, -5% 100%, 40% 50%)",
          }}
         ></div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col h-full mt-16 p-6">
            {/* Name and Title */}
            <div className="mb-3">
              <h2 className="text-xl font-bold text-gray-900">{user?.name || "NOWSHAD HAMEED"}</h2>
              <p className="text-sm text-gray-600 ">{user?.title || "Chief Executive Officer"}</p>
            </div>

            {/* Contact Information */}
            <div className="">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-700">{user?.email || "nowshad.hameed@exctel.com"}</span>
              </div>
              
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm text-gray-700">{user?.phone || "+65 9027 7225"}</span>
              </div>
              
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm text-gray-700">{user?.phone2 || "+65 6714 6714 ext 108"}</span>
              </div>
              
              <div className="flex items-start">
                <svg className="w-4 h-4 mr-3 mt-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.243L16 14.586V12a6 6 0 00-12 0v2.586l-1.657 1.657A2 2 0 002 17.414V18a2 2 0 002 2h12a2 2 0 002-2v-.586a2 2 0 00-.586-1.414z" />
                </svg>
                <span className="text-sm text-gray-700 whitespace-pre-line">
                  {user?.address || "7791 Jalan Bukit Merah\n#06-14 E-Centre @ Redhill\nSingapore 159471"}
                </span>
              </div>
              
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span className="text-sm text-gray-700">{user?.website || "www.exctel.com"}</span>
              </div>
            </div>

            {/* Logo at the bottom */}
            <div className="mt-auto pt-4 flex justify-end">
              <div className="w-28 h-auto">
                <img src="public/Group 2.svg" alt="Company Logo" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className="business-card-side business-card-back relative bg-white h-full flex flex-col items-center justify-between">
          {/* Background Pattern */}
          {/* <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-20" /> */}
          {/* <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100 to-transparent opacity-20 transform rotate-45" /> */}
          <div
          className="absolute w-[250px] h-[450px] ">
          <img className="w-full h-full" src="/public/Clip path group.png" alt="" />
         </div>
         <div className="p-6">

         
          {/* Logo */}
         

          {/* Certification Badges */}
          <div className="flex space-x-6 my-6 relative z-10 mt-36 pr-16 pl-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-medium shadow-sm hover:shadow-md transition-shadow duration-200">
              BizSafe
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-medium shadow-sm hover:shadow-md transition-shadow duration-200">
              ISO
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-medium shadow-sm hover:shadow-md transition-shadow duration-200">
              Excellence
            </div>
          </div>
          <div className="flex space-x-8  relative z-10 mt-3 mx-20">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-medium shadow-sm hover:shadow-md transition-shadow duration-200">
              BizSafe
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-medium shadow-sm hover:shadow-md transition-shadow duration-200">
              ISO
            </div>
           
          </div>

          {/* QR Code */}
          <div className="mb-11 relative z-10 flex justify-center">
            <QRCodeSVG
              value={qrCodeData || "https://www.exctel.com"}
              size={120}
              includeMargin={true}
              bgColor="#FFFFFF"
              fgColor="#000000"
              level="H"
            />
          </div>

          {/* Excellence text */}
          {/* <div className="absolute right-[-25px] bottom-20 transform rotate-90 text-xs tracking-widest text-gray-600 font-medium">
            DRIVEN BY EXCELLENCE
          </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;