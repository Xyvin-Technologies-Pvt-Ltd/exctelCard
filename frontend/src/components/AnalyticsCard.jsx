import React from "react";
import {
  Eye,
  Download,
  Copy,
  Mail,
  Phone,
  Linkedin,
  ExternalLink,
  Calendar,
  TrendingUp,
} from "lucide-react";
import Card from "./Card";

const AnalyticsCard = ({ analytics = {}, className = "" }) => {
  const {
    websiteViews = 0,
    profileViews = 0,
    downloads = 0,
    vcardDownloads = 0,
    linkCopies = 0,
    contactInteractions = 0,
    emailClicks = 0,
    phoneClicks = 0,
    linkedinClicks = 0,
    firstViewAt,
    lastInteractionAt,
  } = analytics;

  const totalViews = websiteViews + profileViews;
  const totalInteractions = contactInteractions + downloads;

  const formatDate = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const StatItem = ({ icon: Icon, label, value, color = "text-gray-600" }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg bg-white ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <span className="text-lg font-bold text-gray-900">{value}</span>
    </div>
  );

  return (
    <Card className={`p-6 ${className}`}>
      <Card.Header className="pb-4">
        <Card.Title className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          <span>Profile Analytics</span>
        </Card.Title>
        <Card.Description>
          Track how people interact with your shared profile
        </Card.Description>
      </Card.Header>

      <Card.Content className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {totalViews}
            </div>
            <div className="text-sm text-orange-700">Total Views</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {totalInteractions}
            </div>
            <div className="text-sm text-blue-700">Total Interactions</div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
            View Details
          </h4>
          <StatItem
            icon={Eye}
            label="Website Views"
            value={websiteViews}
            color="text-orange-600"
          />
          <StatItem
            icon={Eye}
            label="Profile Views"
            value={profileViews}
            color="text-blue-600"
          />
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
            Downloads & Shares
          </h4>
          <StatItem
            icon={Download}
            label="vCard Downloads"
            value={vcardDownloads}
            color="text-green-600"
          />
          <StatItem
            icon={Copy}
            label="Link Copies"
            value={linkCopies}
            color="text-purple-600"
          />
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
            Contact Interactions
          </h4>
          <StatItem
            icon={Mail}
            label="Email Clicks"
            value={emailClicks}
            color="text-red-600"
          />
          <StatItem
            icon={Phone}
            label="Phone Clicks"
            value={phoneClicks}
            color="text-indigo-600"
          />
          <StatItem
            icon={Linkedin}
            label="LinkedIn Clicks"
            value={linkedinClicks}
            color="text-blue-700"
          />
        </div>

        {/* Timeline */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
            Timeline
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">First View:</span>
              <span className="font-medium">{formatDate(firstViewAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Interaction:</span>
              <span className="font-medium">
                {formatDate(lastInteractionAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Engagement Rate */}
        {totalViews > 0 && (
          <div className="p-4 bg-gradient-to-r from-orange-50 to-blue-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {Math.round((totalInteractions / totalViews) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Engagement Rate</div>
              <div className="text-xs text-gray-500 mt-1">
                {totalInteractions} interactions from {totalViews} views
              </div>
            </div>
          </div>
        )}
      </Card.Content>
    </Card>
  );
};

export default AnalyticsCard;
