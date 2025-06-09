import React, { useState } from "react";
import {
  FaCopy,
  FaCheck,
  FaQrcode,
  FaLink,
  FaShareAlt,
  FaLock,
} from "react-icons/fa";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { useAuth } from "../contexts/AuthContext";

// Read-only field component for Entra ID data
const ReadOnlyField = ({ label, value, helperText }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <FaLock
        className="inline ml-2 text-xs text-gray-400"
        title="This field is managed by your organization"
      />
    </label>
    <div className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-700">
      {value || "Not provided"}
    </div>
    {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
  </div>
);

const Profile = () => {
  const { user: authUser } = useAuth();

  // Use real Entra ID data or fallback to demo data
  const entraidUser = authUser || {
    name: "Jane Doe",
    email: "jane.doe@exctel.com",
    department: "Engineering",
    jobTitle: "Senior Developer",
    tenantId: "12345678-1234-1234-1234-123456789012",
  };

  // Static/demo data for fields not in Entra ID
  const localUserData = {
    phone: "+1 (555) 123-4567",
    linkedIn: "https://linkedin.com/in/janedoe",
    profileImage: "",
    shareId: "abc123",
  };

  // State for ONLY editable fields (not managed by Entra ID)
  const [formData, setFormData] = useState({
    phone: localUserData.phone,
    linkedIn: localUserData.linkedIn,
    profileImage: localUserData.profileImage,
  });

  // State for UI interactions
  const [copied, setCopied] = useState(false);
  const [directLinkCopied, setDirectLinkCopied] = useState(false);
  const [hasShareId, setHasShareId] = useState(!!localUserData.shareId);
  const [isGenerating, setIsGenerating] = useState(false);

  // URLs for sharing (use email as the profile identifier)
  const profileSlug = entraidUser.email
    ? entraidUser.email.split("@")[0]
    : "user";
  const shareableUrl = `${window.location.origin}/profile/${profileSlug}`;
  const directShareableUrl = `${window.location.origin}/share/${localUserData.shareId}`;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const copyToClipboard = () => {
    // Simulate copying to clipboard
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyDirectLink = () => {
    // Simulate copying to clipboard
    setDirectLinkCopied(true);
    setTimeout(() => setDirectLinkCopied(false), 2000);
  };

  const handleGenerateShareId = () => {
    // Simulate generating share ID
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasShareId(true);
    }, 1000);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    try {
      // Only submit editable fields - Entra ID fields are read-only
      const dataToSubmit = {
        // Include Entra ID data for context (but won't be updated)
        userId: entraidUser.email,
        // Only these fields can be updated
        phone: formData.phone,
        linkedIn: formData.linkedIn,
        profileImage: formData.profileImage,
      };

      console.log("📝 Submitting editable profile data:", dataToSubmit);

      // TODO: Replace with actual API call
      // const response = await fetch('/api/profile/update', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(dataToSubmit)
      // });

      alert(
        "Editable profile fields updated successfully!\n\nUpdated:\n- Phone: " +
          formData.phone +
          "\n- LinkedIn: " +
          formData.linkedIn +
          "\n- Profile Image: " +
          (formData.profileImage || "Not set")
      );
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleReset = () => {
    // Reset only editable fields (Entra ID fields cannot be reset)
    setFormData({
      phone: localUserData.phone,
      linkedIn: localUserData.linkedIn,
      profileImage: localUserData.profileImage,
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Profile - {entraidUser.name}
        </h1>
        <p className="text-gray-600 mt-1">
          Update your profile information. Some fields are managed by your
          organization and cannot be edited.
        </p>
      </div>

      <Card className="mb-6">
        <div className="p-4 text-left">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-left">
            <FaLink className="mr-2 text-indigo-600" /> Your Shareable Profile
            Link
          </h2>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-100 p-3 rounded text-sm truncate text-left">
              {shareableUrl}
            </div>
            <Button onClick={copyToClipboard} className="flex items-center">
              {copied ? (
                <>
                  <FaCheck className="mr-1" /> Copied!
                </>
              ) : (
                <>
                  <FaCopy className="mr-1" /> Copy
                </>
              )}
            </Button>
          </div>
          <div className="mt-4 text-sm text-gray-600 text-left">
            Share this link to let others view your professional profile. They
            will see your public information.
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <div className="p-4 text-left">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-left">
            <FaShareAlt className="mr-2 text-green-600" /> Direct Shareable Link
          </h2>

          {hasShareId ? (
            <>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-100 p-3 rounded text-sm truncate text-left">
                  {directShareableUrl}
                </div>
                <Button onClick={copyDirectLink} className="flex items-center">
                  {directLinkCopied ? (
                    <>
                      <FaCheck className="mr-1" /> Copied!
                    </>
                  ) : (
                    <>
                      <FaCopy className="mr-1" /> Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="mt-4 text-sm text-gray-600 text-left">
                This direct link is easier to share and doesn't require scanning
                a QR code. Anyone with this link can view your business card
                information.
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-4 text-left">
                Generate a direct shareable link that's easier to share than a
                QR code.
              </p>
              <Button
                onClick={handleGenerateShareId}
                variant="success"
                className="flex items-center"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  "Generating..."
                ) : (
                  <>
                    <FaShareAlt className="mr-1" /> Generate Share Link
                  </>
                )}
              </Button>
            </>
          )}

          <div className="mt-4 text-left">
            <a
              href="/qrcode"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <FaQrcode className="mr-1" /> View QR Code
            </a>
          </div>
        </div>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Profile Information</Card.Title>
          <Card.Description>
            Fields with a lock icon are managed by your organization and cannot
            be edited.
          </Card.Description>
        </Card.Header>

        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Entra ID Managed Fields (Read-only) */}
            <ReadOnlyField
              label="Full Name"
              value={entraidUser.name}
              helperText="Managed by your organization"
            />

            <ReadOnlyField
              label="Email Address"
              value={entraidUser.email}
              helperText="Your organization email"
            />

            <ReadOnlyField
              label="Department"
              value={entraidUser.department}
              helperText="Set by your organization"
            />

            <ReadOnlyField
              label="Job Title"
              value={entraidUser.jobTitle}
              helperText="Managed by HR"
            />

            {/* Editable Fields */}
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              helperText="Your contact phone number"
              placeholder="+1 (555) 123-4567"
            />

            <div className="md:col-span-1">
              <Input
                label="LinkedIn Profile URL"
                name="linkedIn"
                value={formData.linkedIn}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/yourprofile"
                helperText="Optional: Your LinkedIn profile"
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="Profile Image URL"
                name="profileImage"
                value={formData.profileImage}
                onChange={handleInputChange}
                placeholder="https://example.com/profile.jpg"
                helperText="Optional: URL to your profile picture"
              />
            </div>
          </div>
        </Card.Content>

        <Card.Footer>
          <Button type="button" variant="secondary" onClick={handleReset}>
            Reset Editable Fields
          </Button>
          <Button type="button" variant="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default Profile;
