import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { Button } from "../ui/Button";

const DigitalCard = () => {
  const { companySlug, userId } = useParams();
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const response = await api.cards.getBySlug(companySlug, userId);
        setCardData(response.data);
      } catch (err) {
        setError(err.message || "Failed to load card");
      } finally {
        setLoading(false);
      }
    };

    fetchCardData();
  }, [companySlug, userId]);

  const handleDownloadVCard = async () => {
    try {
      await api.cards.downloadVCard(userId);
      // Record interaction
      await api.cards.recordInteraction(userId, "contact_download", {
        downloadFormat: "vcard",
      });
    } catch (error) {
      console.error("Error downloading vCard:", error);
    }
  };

  const handleContact = async (type, value) => {
    try {
      await api.cards.recordInteraction(userId, `${type}_click`, {
        contactMethod: type,
        contactValue: value,
      });

      if (type === "email") {
        window.location.href = `mailto:${value}`;
      } else if (type === "phone") {
        window.location.href = `tel:${value}`;
      } else if (type === "website") {
        window.open(value, "_blank");
      }
    } catch (error) {
      console.error("Error recording interaction:", error);
    }
  };

  const handleSocialClick = async (platform, url) => {
    try {
      await api.cards.recordInteraction(userId, "social_click", {
        socialPlatform: platform,
        linkUrl: url,
      });
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error recording social interaction:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading digital card...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Card Not Found
          </h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Digital Business Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full opacity-50 transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-50 rounded-full opacity-50 transform -translate-x-12 translate-y-12"></div>

          <div className="relative z-10">
            {/* Company Logo/Branding */}
            {cardData.company.logo ? (
              <div className="text-center mb-6">
                <img
                  src={cardData.company.logo}
                  alt={cardData.company.name}
                  className="h-12 mx-auto"
                />
              </div>
            ) : (
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-white font-bold text-2xl">
                    {cardData.company.name.charAt(0)}
                  </span>
                </div>
              </div>
            )}

            {/* Profile Photo */}
            <div className="text-center mb-6">
              {cardData.profilePicture ? (
                <img
                  src={cardData.profilePicture}
                  alt={cardData.fullName}
                  className="w-24 h-24 rounded-2xl mx-auto object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl mx-auto flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-gray-600 font-semibold text-2xl">
                    {cardData.firstName?.charAt(0)}
                    {cardData.lastName?.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Name and Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {cardData.fullName}
              </h1>
              {cardData.jobTitle && (
                <p className="text-lg text-gray-600 mb-1">
                  {cardData.jobTitle}
                </p>
              )}
              {cardData.department && (
                <p className="text-gray-500">{cardData.department}</p>
              )}
              <p className="text-orange-600 font-medium mt-2">
                {cardData.company.name}
              </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-4 mb-8">
              {/* Email */}
              <button
                onClick={() => handleContact("email", cardData.email)}
                className="w-full flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 group"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors duration-200">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{cardData.email}</p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </button>

              {/* Phone */}
              {cardData.phoneNumber && (
                <button
                  onClick={() => handleContact("phone", cardData.phoneNumber)}
                  className="w-full flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 group"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors duration-200">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">
                      {cardData.phoneNumber}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </button>
              )}

              {/* Company Website */}
              {cardData.company.website && (
                <button
                  onClick={() =>
                    handleContact("website", cardData.company.website)
                  }
                  className="w-full flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 group"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors duration-200">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm text-gray-500">Website</p>
                    <p className="font-medium text-gray-900">
                      {cardData.company.website}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Social Links */}
            {cardData.socialLinks &&
              Object.keys(cardData.socialLinks).some(
                (key) => cardData.socialLinks[key]
              ) && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">
                    Connect with me
                  </h3>
                  <div className="flex justify-center space-x-4">
                    {cardData.socialLinks.linkedin && (
                      <button
                        onClick={() =>
                          handleSocialClick(
                            "linkedin",
                            cardData.socialLinks.linkedin
                          )
                        }
                        className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:bg-blue-700 transition-colors duration-200"
                      >
                        <span className="text-sm font-bold">in</span>
                      </button>
                    )}
                    {cardData.socialLinks.twitter && (
                      <button
                        onClick={() =>
                          handleSocialClick(
                            "twitter",
                            cardData.socialLinks.twitter
                          )
                        }
                        className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center text-white hover:bg-sky-600 transition-colors duration-200"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      </button>
                    )}
                    {cardData.socialLinks.github && (
                      <button
                        onClick={() =>
                          handleSocialClick(
                            "github",
                            cardData.socialLinks.github
                          )
                        }
                        className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-white hover:bg-gray-900 transition-colors duration-200"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      </button>
                    )}
                    {cardData.socialLinks.website && (
                      <button
                        onClick={() =>
                          handleSocialClick(
                            "website",
                            cardData.socialLinks.website
                          )
                        }
                        className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white hover:bg-orange-600 transition-colors duration-200"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={handleDownloadVCard}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
          >
            <svg
              className="w-6 h-6 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Save to Contacts
          </Button>

          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Powered by{" "}
              <span className="font-semibold text-orange-600">
                Exctel Digital Cards
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalCard;
