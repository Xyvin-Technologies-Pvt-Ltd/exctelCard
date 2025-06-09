# 🔐 Entra ID Profile Integration

## 📋 **Overview**

The Profile page has been updated to properly integrate with **Microsoft Entra ID (Azure AD)** data, distinguishing between **organization-managed fields** (read-only) and **user-editable fields**.

---

## 🏗️ **Architecture**

### **Data Sources:**

#### **1. ✅ Entra ID Managed (Read-Only)**

Fields that come from your organization's directory and **cannot be edited**:

```javascript
const entraidUser = authUser || {
  name: "Jane Doe", // displayName from Entra ID
  email: "jane.doe@exctel.com", // mail from Entra ID
  department: "Engineering", // department from Entra ID
  jobTitle: "Senior Developer", // jobTitle from Entra ID
  tenantId: "12345...", // Azure tenant ID
};
```

#### **2. ✏️ User Editable (Local Storage/Database)**

Fields that users can modify themselves:

```javascript
const [formData, setFormData] = useState({
  phone: "+1 (555) 123-4567", // Personal phone
  linkedIn: "https://linkedin.com/...", // LinkedIn profile
  profileImage: "https://...", // Profile picture URL
});
```

---

## 🎨 **UI Implementation**

### **🔒 Read-Only Fields Component**

```jsx
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
```

### **✏️ Editable Fields**

Uses the modern `Input` component with validation and helper text:

```jsx
<Input
  label="Phone Number"
  name="phone"
  value={formData.phone}
  onChange={handleInputChange}
  helperText="Your contact phone number"
/>
```

---

## 📊 **Field Mapping**

| **Field**         | **Source** | **Editable** | **Entra ID Property** | **Notes**               |
| ----------------- | ---------- | ------------ | --------------------- | ----------------------- |
| **Full Name**     | Entra ID   | ❌ No        | `displayName`         | Managed by organization |
| **Email**         | Entra ID   | ❌ No        | `mail`                | Organization email      |
| **Department**    | Entra ID   | ❌ No        | `department`          | Set by HR               |
| **Job Title**     | Entra ID   | ❌ No        | `jobTitle`            | Managed by HR           |
| **Phone**         | Local      | ✅ Yes       | N/A                   | Personal contact        |
| **LinkedIn**      | Local      | ✅ Yes       | N/A                   | Professional profile    |
| **Profile Image** | Local      | ✅ Yes       | N/A                   | Custom avatar           |

---

## 🔄 **Data Flow**

### **1. Page Load:**

```javascript
const { user: authUser } = useAuth(); // Get Entra ID data from context
const entraidUser = authUser || fallbackData; // Use real data or demo
```

### **2. Form Submission:**

```javascript
const handleSubmit = async (e) => {
  const dataToSubmit = {
    userId: entraidUser.email, // Entra ID identifier
    phone: formData.phone, // Only editable fields
    linkedIn: formData.linkedIn,
    profileImage: formData.profileImage,
  };

  // Submit to API - Entra ID fields are ignored
  await updateUserProfile(dataToSubmit);
};
```

### **3. Reset Function:**

```javascript
const handleReset = () => {
  // Only reset editable fields - Entra ID fields cannot be changed
  setFormData({
    phone: localUserData.phone,
    linkedIn: localUserData.linkedIn,
    profileImage: localUserData.profileImage,
  });
};
```

---

## 🛡️ **Security Considerations**

### **✅ Benefits:**

- **Data Integrity:** Entra ID fields cannot be tampered with
- **Single Source of Truth:** Organization data stays consistent
- **Reduced Admin Overhead:** No need to manage name/email changes
- **Compliance:** Meets organizational data governance requirements

### **🔒 Implementation:**

```javascript
// Read-only fields are never included in form state
// Only editable fields are submitted to the API
// Backend should validate that Entra ID fields are not modified
```

---

## 🎯 **User Experience**

### **🔍 Visual Indicators:**

- **Lock icon** 🔒 next to read-only fields
- **Gray background** for non-editable inputs
- **Helper text** explaining why fields are locked
- **Clear section separation** between managed and editable fields

### **📝 Form Behavior:**

- **Reset button** only affects editable fields
- **Save button** only submits changeable data
- **Clear messaging** about what can/cannot be edited

---

## 🚀 **API Integration**

### **Backend Endpoint:**

```javascript
// PUT /api/profile/update
{
  "userId": "jane.doe@exctel.com",  // Entra ID identifier
  "phone": "+1 (555) 123-4567",    // Editable field
  "linkedIn": "https://...",        // Editable field
  "profileImage": "https://..."     // Editable field
}
```

### **Backend Validation:**

```javascript
// Server should verify:
// 1. User ID matches authenticated user's Entra ID
// 2. Only editable fields are being updated
// 3. Entra ID fields are never modified through this endpoint
```

---

## 📱 **Responsive Design**

### **Mobile Layout:**

- **Stacked fields** on small screens
- **Touch-friendly** inputs and buttons
- **Clear visual hierarchy** between field types
- **Accessible** lock icons and helper text

### **Desktop Layout:**

- **Two-column grid** for efficient space usage
- **Side-by-side** read-only and editable fields
- **Clear grouping** of field types

---

## 🔧 **Implementation Benefits**

### **👥 For Users:**

- ✅ **Clear expectations** - know what can be changed
- ✅ **Reduced errors** - can't accidentally break organization data
- ✅ **Faster forms** - fewer fields to fill out
- ✅ **Professional appearance** - matches enterprise standards

### **🏢 For Organizations:**

- ✅ **Data consistency** - employee info stays accurate
- ✅ **Reduced support** - fewer "my name is wrong" tickets
- ✅ **Compliance** - meets data governance requirements
- ✅ **Integration** - works with existing Entra ID setup

### **💻 For Developers:**

- ✅ **Clear separation** - distinct data sources
- ✅ **Maintainable** - easy to add new editable fields
- ✅ **Secure** - reduced attack surface
- ✅ **Testable** - clear data flow patterns

---

## 🔄 **Future Enhancements**

### **🔥 High Priority:**

1. **Real API integration** - Replace demo alerts with actual endpoints
2. **Field validation** - Phone number formatting, URL validation
3. **Image upload** - Direct image upload instead of URL input
4. **Sync status** - Show when Entra ID data was last updated

### **🔨 Medium Priority:**

5. **Conditional fields** - Show/hide fields based on user role
6. **Bulk updates** - Admin interface for updating multiple users
7. **Audit logging** - Track who changed what when
8. **Profile preview** - Show how profile appears to others

---

## 💡 **Best Practices**

### **🎨 UI/UX:**

- Always use lock icons for read-only fields
- Provide clear helper text explaining field sources
- Use consistent styling between field types
- Make editable fields visually distinct

### **🔒 Security:**

- Never include Entra ID fields in form submission
- Validate user permissions on the backend
- Use user's Entra ID as the primary identifier
- Implement proper session management

### **📊 Data Management:**

- Keep editable fields in separate database table
- Use Entra ID email as foreign key
- Cache Entra ID data appropriately
- Handle cases where Entra ID data is missing

---

✅ **The Profile page now provides a professional, secure, and user-friendly experience that properly integrates with organizational identity management while allowing users to customize their personal information.**
