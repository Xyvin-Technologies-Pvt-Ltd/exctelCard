import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { User, Mail, Phone, Download, RotateCcw, Copy, Check } from 'lucide-react';
import Card from '../components/Card';

const ShareView = () => {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
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
                <div className="flex items-center justify-between p-4  rounded-lg  transition-colors cursor-pointer border-2">
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

                <div className="flex items-center justify-between p-4 rounded-lg  transition-colors cursor-pointer border-2 ">
                  <div className="flex items-center ">
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

                <div className="flex items-center justify-between p-4 rounded-lg  transition-colors cursor-pointer border-2">
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
  );
};

export default ShareView;