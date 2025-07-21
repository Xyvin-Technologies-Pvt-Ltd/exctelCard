# 🗄️ **Database Integration & Admin Dashboard**

## 📋 **Overview**

The DigiCard system now includes comprehensive **MongoDB/Mongoose integration** with proper models for users, activities, SSO configuration, and admin management. This replaces the static demo data with real database-backed functionality.

---

## 🏗️ **Database Architecture**

### **📊 Data Models**

#### **1. 👤 User Model (`user.model.js`)**

```javascript
{
  // Entra ID / SSO fields (read-only)
  entraId: String,           // Azure AD unique ID
  email: String,             // Primary identifier (unique)
  name: String,              // Display name
  department: String,        // Organization department
  jobTitle: String,          // Job position
  tenantId: String,          // Azure tenant ID

  // User editable fields
  phone: String,             // Contact phone
  linkedIn: String,          // LinkedIn profile URL
  profileImage: String,      // Profile picture URL

  // System fields
  role: enum,                // 'user', 'admin', 'super_admin'
  loginType: enum,           // 'sso', 'password'
  isActive: Boolean,         // Account status
  shareId: String,           // Unique sharing identifier

  // Activity tracking
  lastLoginAt: Date,         // Last login timestamp
  profileViewCount: Number,  // Total profile views
  loginCount: Number,        // Total login count

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

#### **2. 📈 UserActivity Model (`userActivity.model.js`)**

```javascript
{
  userId: ObjectId,          // Reference to User
  activityType: enum,        // Type of activity performed
  source: enum,              // How the activity originated

  // Visitor information
  visitorInfo: {
    ipAddress: String,
    userAgent: String,
    device: String,
    browser: String,
    country: String
  },

  // Location data
  location: {
    country: String,
    city: String,
    latitude: Number,
    longitude: Number
  },

  metadata: Object,          // Additional activity data
  createdAt: Date
}
```

#### **3. 🔧 SSOConfig Model (`ssoConfig.model.js`)**

```javascript
{
  provider: enum,            // 'microsoft', 'google', 'okta', etc.
  providerName: String,      // Display name

  // OAuth configuration
  clientId: String,
  clientSecret: String,      // Encrypted in production
  tenantId: String,
  redirectUri: String,

  // Settings
  autoProvisioning: Boolean,
  defaultRole: enum,
  isActive: Boolean,
  isPrimary: Boolean,        // Only one primary provider

  // Audit
  createdBy: ObjectId,
  lastModifiedBy: ObjectId,
  testResult: Object,        // Last connection test

  // Statistics
  loginCount: Number,
  lastLoginAt: Date
}
```

---

## 🚀 **API Endpoints**

### **📊 Admin Dashboard Endpoints**

#### **GET `/api/admin/dashboard/stats`**

Returns overview statistics for the admin dashboard.

```javascript
// Response
{
  "success": true,
  "data": {
    "users": {
      "totalUsers": 150,
      "newUsersThisMonth": 23,
      "activeUsersThisWeek": 87
    },
    "activity": {
      "totalActivities": 1250,
      "analytics": [...]
    },
    "topActiveUsers": [...],
    "sso": {
      "isConfigured": true,
      "provider": "microsoft",
      "lastLogin": "2025-01-09T10:30:00Z"
    }
  }
}
```

#### **GET `/api/admin/users`**

Paginated user list with search and filtering.

```javascript
// Query Parameters
?page=1&limit=20&search=john&department=Engineering&isActive=true

// Response
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "...",
        "name": "John Doe",
        "email": "john.doe@exctel.com",
        "department": "Engineering",
        "lastLoginAt": "2025-01-09T10:30:00Z",
        "activity": {
          "total": 23,
          "websiteView": 8,
          "cardScan": 5,
          "cardDownloads": 10
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

#### **GET `/api/admin/users/:userId/activity`**

Detailed activity analysis for a specific user.

```javascript
// Response
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john.doe@exctel.com"
    },
    "activity": {
      "total": 23,
      "websiteView": 8,
      "cardScan": 5,
      "cardDownloads": 10,
      "activities": [
        {
          "type": "profile_view",
          "count": 8,
          "lastActivity": "2025-01-09T10:30:00Z"
        }
      ]
    }
  }
}
```

### **🔧 SSO Configuration Endpoints**

#### **GET `/api/admin/sso/configurations`**

Get all SSO provider configurations.

#### **POST `/api/admin/sso/configurations`**

Create or update SSO configuration.

```javascript
// Request Body
{
  "provider": "microsoft",
  "providerName": "Microsoft Entra ID",
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "tenantId": "your-tenant-id",
  "redirectUri": "http://localhost:5000/api/auth/callback",
  "autoProvisioning": true,
  "defaultRole": "user",
  "isActive": true,
  "isPrimary": true
}
```

#### **POST `/api/admin/sso/configurations/:configId/test`**

Test SSO configuration connectivity.

---

## 🔐 **Authentication & Authorization**

### **Middleware Stack**

```javascript
// All admin routes require authentication + admin role
router.use(authenticateToken); // Verify JWT token
router.use(requireAdmin); // Check admin role
```

### **Admin Access Control**

```javascript
// Role-based access (preferred)
if (req.user.role === "admin" || req.user.role === "super_admin") {
  // Grant access
}

// Email-based fallback (for backward compatibility)
const adminEmails = process.env.ADMIN_EMAILS.split(",");
if (adminEmails.includes(req.user.email)) {
  // Grant access
}
```

---

## 📈 **Activity Tracking**

### **Activity Types**

```javascript
const activityTypes = [
  "profile_view", // Someone viewed the user's profile
  "qr_scan", // QR code was scanned
  "card_download", // Business card was downloaded
  "link_click", // Profile link was clicked
  "contact_save", // Contact was saved to phone
  "linkedin_click", // LinkedIn profile was clicked
  "phone_click", // Phone number was clicked
  "email_click", // Email was clicked
  "profile_share", // Profile was shared
  "login", // User logged in
  "profile_update", // User updated their profile
];
```

### **Tracking Implementation**

```javascript
// Track user activity
await UserActivity.trackActivity({
  userId: user._id,
  activityType: "profile_view",
  source: "qr_code",
  visitorInfo: {
    ipAddress: req.ip,
    userAgent: req.get("User-Agent"),
    device: "mobile",
    browser: "Chrome",
  },
  location: {
    country: "Singapore",
    city: "Singapore",
  },
  metadata: {
    referrer: "linkedin.com",
    campaign: "networking-event",
  },
});
```

---

## 🔄 **User Management Integration**

### **SSO User Creation**

When users login via SSO, they're automatically created in the database:

```javascript
// In auth.controller.js handleCallback
let user = await User.findOne({ email: azureUserInfo.email });

if (!user) {
  // Create new user from Azure AD data
  user = new User({
    entraId: azureUserInfo.entraId,
    email: azureUserInfo.email,
    name: azureUserInfo.name,
    tenantId: azureUserInfo.tenantId,
    role: "user",
    loginType: "sso",
    isActive: true,
    createdBy: "sso",
  });
  await user.save();
}

// Track login activity
await UserActivity.trackActivity({
  userId: user._id,
  activityType: "login",
  source: "sso",
});
```

### **Admin User Creation**

Admin users are created via the admin login system:

```javascript
// In auth.controller.js adminLogin
const adminUser = {
  id: "admin-" + crypto.randomBytes(8).toString("hex"),
  email: adminEmail,
  name: "Super Administrator",
  role: "admin",
  loginType: "password",
};
```

---

## 📊 **Database Queries & Analytics**

### **Built-in Model Methods**

#### **User Statistics**

```javascript
// Get admin dashboard stats
const stats = await User.getAdminStats();
// Returns: { totalUsers, newUsersThisMonth, activeUsersThisWeek }

// Search users with pagination
const result = await User.searchForAdmin("john", 1, 20);
// Returns: { users, pagination }
```

#### **Activity Analytics**

```javascript
// Get user activity summary
const activity = await UserActivity.getUserActivitySummary(userId, 30);
// Returns: { total, websiteView, cardScan, cardDownloads, activities }

// Get system-wide analytics
const analytics = await UserActivity.getActivityAnalytics(30);
// Returns activity breakdown by type and date

// Get top active users
const topUsers = await UserActivity.getTopActiveUsers(10, 30);
// Returns users ranked by activity count
```

### **Example Aggregation Queries**

```javascript
// Department breakdown
const departmentStats = await User.aggregate([
  { $match: { isActive: true } },
  { $group: { _id: "$department", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);

// Activity heatmap by hour
const hourlyActivity = await UserActivity.aggregate([
  {
    $group: {
      _id: { $hour: "$createdAt" },
      count: { $sum: 1 },
    },
  },
  { $sort: { _id: 1 } },
]);
```

---

## 🚀 **Frontend Integration**

### **Admin Dashboard Updates Required**

#### **Replace Static Data**

```javascript
// Before (static data)
const sampleUsers = [
  { _id: "1", name: "John Doe", ... }
];

// After (API integration)
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchUsers();
}, []);

const fetchUsers = async () => {
  try {
    const response = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setUsers(data.data.users);
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    setLoading(false);
  }
};
```

#### **Real SSO Configuration**

```javascript
// Fetch real SSO configurations
const [ssoConfigs, setSsoConfigs] = useState([]);

const fetchSSOConfigurations = async () => {
  const response = await fetch("/api/admin/sso/configurations", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  setSsoConfigs(data.data);
};

// Save SSO configuration
const saveSSOConfig = async (configData) => {
  await fetch("/api/admin/sso/configurations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(configData),
  });
};
```

---

## 🔧 **Database Setup & Migration**

### **Environment Variables**

```bash
# Database
DATABASE_URL=mongodb://localhost:27017/exctelcard
DB_NAME=exctelcard

# Admin credentials
ADMIN_EMAIL=admin@exctel.com
ADMIN_PASSWORD=SuperSecurePassword123!
ADMIN_EMAILS=admin@exctel.com,super.admin@exctel.com

# Existing Azure/JWT config
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
JWT_SECRET=...
```

### **First Time Setup**

```bash
# Install dependencies
npm install mongoose

# Start MongoDB (if using local)
mongod

# Run the application
npm start

# The database and collections will be created automatically
# Admin can login and start managing users
```

### **Database Indexes**

The models include performance optimizations:

```javascript
// User model indexes
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ department: 1, isActive: 1 });
userSchema.index({ lastLoginAt: -1 });

// Activity model indexes
userActivitySchema.index({ userId: 1, activityType: 1, createdAt: -1 });
userActivitySchema.index({ activityType: 1, createdAt: -1 });
```

---

## 🎯 **Key Benefits**

### **📊 For Administrators**

- **Real Data**: Actual user counts, activity metrics, and system statistics
- **User Management**: Search, filter, activate/deactivate users
- **Activity Insights**: Detailed user engagement analytics
- **SSO Control**: Manage multiple SSO providers from the dashboard
- **Audit Trail**: Complete logging of admin actions and user activities

### **⚡ For Performance**

- **Database Indexes**: Optimized queries for large user bases
- **Pagination**: Efficient handling of large datasets
- **Caching**: Built-in aggregation for common statistics
- **Lazy Loading**: Load data as needed in the frontend

### **🔒 For Security**

- **Role-based Access**: Proper admin authorization
- **Data Validation**: Mongoose schema validation
- **Audit Logging**: Track all admin and user actions
- **Secure Storage**: Proper handling of sensitive configuration

---

✅ **The DigiCard system now has a complete database-backed admin dashboard with real user management, activity tracking, and SSO configuration capabilities.**
