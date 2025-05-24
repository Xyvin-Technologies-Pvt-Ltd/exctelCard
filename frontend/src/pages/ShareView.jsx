import React, { useState } from 'react';
import { User, Mail, Phone, Download, RotateCcw, Copy, Check, Share2, MoreHorizontal, UserPlus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';

const ShareView = () => {
  const navigate = useNavigate();
  const id = '123'; // Mock ID for demo
  const [copied, setCopied] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

  // Static user data for demonstration
  const staticUser = {
    name: "NOWSHAD HAMEED",
    title: "Chief Executive Officer",
    email: "nowshad.hameed@exctel.com",
    phone: "+65 9027 7225",
    phone2: "+65 6714 6714 ext 108",
    address: "7791 Jalan Bukit Merah\n#06-14 E-Centre @ Redhill\nSingapore 159471",
    website: "www.exctel.com"
  };

  // Contact details for the admin user (as shown in the image)
  const adminContact = {
    name: "Ashin",
    email: "admin@exctel.com",
    phone: "+1132-001-3835"
  };

  const handleSaveToContacts = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${staticUser.name}
TITLE:${staticUser.title}
TEL;TYPE=WORK,VOICE:${staticUser.phone}
TEL;TYPE=WORK,VOICE:${staticUser.phone2}
EMAIL;TYPE=WORK:${staticUser.email}
ADR;TYPE=WORK:;;${staticUser.address.replace(/\n/g, ';')}
URL:${staticUser.website}
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${staticUser.name.toLowerCase().replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDownload = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const toggleShareMenu = () => {
    setIsShareMenuOpen(!isShareMenuOpen);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-col items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="relative text-center mb-8">
            <button
              onClick={handleBack}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              Admin User's Digital Card
            </h1>
            <p className="text-gray-600 text-sm">
              Scan the QR code or use the buttons below to save contact
            </p>
          </div>

          {/* Main Content - Row Layout */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Side - Card Component */}
            <div className="flex-1 flex flex-col items-center">
              <div className="w-full max-w-md mb-6">
                <Card
                  user={staticUser}
                  isFlippable={true}
                  qrCodeData={`${window.location.origin}/share/${id || '123'}`}
                />
              </div>
            </div>

            {/* Right Side - Contact Details Section */}
            <div className="flex-1 w-full">
              <div className="border-2 rounded-lg shadow-sm p-6 h-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Contact Details</h3>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer border-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                        <User className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Name</p>
                        <p className="text-sm font-medium text-gray-800">{adminContact.name}</p>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer border-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                        <Mail className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-sm font-medium text-gray-800">{adminContact.email}</p>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer border-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                        <Phone className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                        <p className="text-sm font-medium text-gray-800">{adminContact.phone}</p>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Row - Aligned at the bottom */}
          <div className="flex flex-col lg:flex-row gap-4 mt-4 items-end">
            {/* Left Side Buttons */}
            <div className="flex-1 flex justify-center">
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <button
                  onClick={() => {
                    // This will trigger the flip functionality in your Card component
                    const cardElement = document.querySelector('.card-flip-container');
                    if (cardElement) {
                      cardElement.click();
                    }
                  }}
                  className="flex-1 border-2 text-gray-600 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Flip Card
                </button>

                <button
                  onClick={handleDownload}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex-1 border-2 text-gray-600 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      <span className="text-sm">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      <span className="text-sm">Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Side Button */}
            <div className="flex-1">
              <div className="space-y-4">
                <button
                  onClick={handleSaveToContacts}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center shadow-sm"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Save to Contacts
                </button>

                <p className="text-xs text-center text-gray-500">
                  Save this contact to your device's address book
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Matching Exact UI Design */}
      <div className="lg:hidden min-h-screen bg-gray-50">
        {/* Header Section with Orange Background */}
        <div className="relative">
          {/* Background Pattern */}
          <div className="relative w-full h-64">
            <div className="absolute inset-0 " />
            <img src="/public/Rectangle 475.svg" alt="" className="absolute inset-0 w-full h-full object-cover" />
          </div>

          {/* Profile Header */}
          <div className="relative z-10 px-6 -mt-32">
            
            {/* Header Content */}
            <div className="flex justify-between items-center">
              {/* Name and Title */}
              <div className="text-left text-white">
                <h1 className="text-2xl font-semibold mb-2">{adminContact.name}</h1>
                <p className="text-orange-100 text-sm opacity-90">Chief Executive Officer</p>
              </div>

              {/* Profile Avatar */}
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                <span className="text-3xl font-semibold text-gray-600">{adminContact.name.charAt(0)}</span>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className=" mt-12 relative z-10 pb-0">
            <div className="pt-8 pb-6">
              <div className="px-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Profile</h2>

                <div className="space-y-4">
                  {/* Email */}
                  <div className="flex items-center py-4 border-2 p-4 border-gray-100">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <Mail className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="text-sm font-medium text-gray-800">{adminContact.email}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center py-4 border-2 p-4 border-gray-100">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <Phone className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <p className="text-sm font-medium text-gray-800">{adminContact.phone}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center py-4 border-2 p-4 border-gray-100">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="text-sm font-medium text-gray-800">3791 Jalan Bukit Merah</p>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={handleSaveToContacts}
                  className="w-full mt-8 bg-orange-500 hover:bg-orange-600 text-white font-medium py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center shadow-sm active:scale-95 transform"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Business Card
                </button>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end mr-6 mb-10">
            <button 
              onClick={handleSaveToContacts}
              className="w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 active:scale-95 transform"
            >
              <UserPlus className="w-6 h-6" />
            </button>
          </div>

        {/* Share Menu */}
        {isShareMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
            <div className="w-full bg-white rounded-t-2xl p-6 transform transition-transform duration-300">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Share Profile</h3>
              <div className="space-y-3">
                <button 
                  onClick={handleCopyLink}
                  className="w-full flex items-center p-4 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <Copy className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="text-gray-800">Copy Link</span>
                </button>
                <button className="w-full flex items-center p-4 hover:bg-gray-50 rounded-xl transition-colors">
                  <Mail className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="text-gray-800">Share via Email</span>
                </button>
              </div>
              <button
                onClick={toggleShareMenu}
                className="w-full mt-4 py-3 text-gray-600 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
      </div>
      );
};

export default ShareView;