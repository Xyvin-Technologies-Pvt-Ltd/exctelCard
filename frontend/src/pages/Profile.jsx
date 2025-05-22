import React, { useState } from "react";
import { FaCopy, FaCheck, FaQrcode, FaLink, FaShareAlt } from "react-icons/fa";
import Card from "../ui/Card";
import Button from "../ui/Button";

const Input = ({ label, name, type = "text", value, onChange, required = false }) => (
  <div className="mb-4 text-left">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1 text-left">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-left"
      required={required}
    />
  </div>
);

const Profile = () => {
  // Static user data
  const staticUser = {
    name: "Jane Doe",
    department: "Engineering",
    jobTitle: "Senior Developer",
    phone: "+1 (555) 123-4567",
    linkedIn: "https://linkedin.com/in/janedoe",
    profileImage: "",
    shareId: "abc123"
  };

  // State for form fields
  const [formData, setFormData] = useState({
    name: staticUser.name,
    department: staticUser.department,
    jobTitle: staticUser.jobTitle,
    phone: staticUser.phone,
    linkedIn: staticUser.linkedIn,
    profileImage: staticUser.profileImage
  });

  // State for UI interactions
  const [copied, setCopied] = useState(false);
  const [directLinkCopied, setDirectLinkCopied] = useState(false);
  const [hasShareId, setHasShareId] = useState(!!staticUser.shareId);
  const [isGenerating, setIsGenerating] = useState(false);

  // URLs for sharing
  const shareableUrl = `${window.location.origin}/profile/jane.doe`;
  const directShareableUrl = `${window.location.origin}/share/${staticUser.shareId}`;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    // Just show an alert in the static version
    alert("Profile updated successfully!");
  };

  const handleReset = () => {
    // Reset form to initial values
    setFormData({
      name: staticUser.name,
      department: staticUser.department,
      jobTitle: staticUser.jobTitle,
      phone: staticUser.phone,
      linkedIn: staticUser.linkedIn,
      profileImage: staticUser.profileImage
    });
  };

  return (
    <div className="max-w-3xl mx-auto text-left">
      <div className="mb-6 text-left">
        <h1 className="text-2xl font-bold text-gray-800 text-left">Edit Profile</h1>
        <p className="text-gray-600 text-left">Update your profile information</p>
      </div>

      <Card className="mb-6">
        <div className="p-4 text-left">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-left">
            <FaLink className="mr-2 text-indigo-600" /> Your Shareable Profile Link
          </h2>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-100 p-3 rounded text-sm truncate text-left">
              {shareableUrl}
            </div>
            <Button
              onClick={copyToClipboard}
              className="flex items-center"
            >
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
            Share this link to let others view your professional profile. They will see your public information.
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
                <Button
                  onClick={copyDirectLink}
                  className="flex items-center"
                >
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
                This direct link is easier to share and doesn't require scanning a QR code. 
                Anyone with this link can view your business card information.
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-4 text-left">
                Generate a direct shareable link that's easier to share than a QR code.
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
        <div className="space-y-4 p-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Job Title"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
            />

            <div className="md:col-span-2">
              <Input
                label="LinkedIn Profile URL"
                name="linkedIn"
                value={formData.linkedIn}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="Profile Image URL"
                name="profileImage"
                value={formData.profileImage}
                onChange={handleInputChange}
                placeholder="https://example.com/profile.jpg"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button type="button" variant="primary" onClick={handleSubmit}>
              Save Changes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;