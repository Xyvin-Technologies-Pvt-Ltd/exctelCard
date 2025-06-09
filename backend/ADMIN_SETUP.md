# 👑 **Admin Login Setup Guide**

## 📋 **Overview**

The DigiCard system now supports **Super Admin login** using email/password authentication, separate from the Microsoft SSO used by regular users.

---

## 🔧 **Environment Variables Setup**

Add the following environment variables to your `backend/.env` file:

```bash
# ===========================
# 👑 SUPER ADMIN CONFIGURATION
# ===========================
ADMIN_EMAIL=admin@exctel.com
ADMIN_PASSWORD=SuperSecureAdminPassword123!
```

### **🔒 Security Recommendations:**

1. **Strong Password**: Use a complex password with:

   - At least 12 characters
   - Mix of uppercase, lowercase, numbers, and symbols
   - No dictionary words or personal information

2. **Secure Email**: Use a dedicated admin email address
3. **Environment Protection**: Never commit `.env` file to version control
4. **Regular Rotation**: Change admin password periodically

---

## 🚀 **API Endpoint**

### **POST `/api/auth/admin/login`**

**Request Body:**

```json
{
  "email": "admin@exctel.com",
  "password": "SuperSecureAdminPassword123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin-a1b2c3d4",
    "email": "admin@exctel.com",
    "name": "Super Administrator",
    "role": "admin",
    "tenantId": "admin",
    "loginType": "password"
  },
  "message": "Admin login successful"
}
```

**Error Responses:**

```json
// 400 - Missing credentials
{
  "success": false,
  "message": "Email and password are required"
}

// 401 - Invalid credentials
{
  "success": false,
  "message": "Invalid admin credentials"
}

// 500 - Not configured
{
  "success": false,
  "message": "Admin authentication not configured"
}
```

---

## 🎨 **Frontend Integration**

The `LoginModern.jsx` page now includes:

### **🔄 Mode Toggle**

- **Default**: Microsoft SSO for regular users
- **Admin Mode**: Email/password form for super admin

### **🎯 User Experience**

```javascript
// Toggle between modes
const [isAdminMode, setIsAdminMode] = useState(false);

// Admin credentials state
const [adminCredentials, setAdminCredentials] = useState({
  email: "",
  password: "",
});
```

### **🔐 Admin Login Flow**

1. User clicks "Admin Access" button
2. Form switches to email/password mode
3. Admin enters credentials
4. Frontend calls `/api/auth/admin/login`
5. On success, redirects to admin dashboard
6. JWT token stored in AuthContext

---

## 🛡️ **Security Features**

### **🔒 Token Security**

- **Shorter Expiry**: Admin tokens expire in 8 hours (vs 24h for users)
- **Role-based**: Token includes `role: "admin"` for authorization
- **Login Type**: Tracks `loginType: "password"` for audit

### **🎯 Access Control**

```javascript
// JWT payload for admin users
{
  "userId": "admin-a1b2c3d4",
  "email": "admin@exctel.com",
  "name": "Super Administrator",
  "role": "admin",              // Key for authorization
  "tenantId": "admin",
  "loginType": "password",      // Audit trail
  "iat": 1640995200,
  "exp": 1641024000
}
```

### **🔍 Audit Logging**

```javascript
// Backend logs all admin login attempts
console.log("🔄 Admin login attempt for:", email);
console.log("✅ Admin credentials validated successfully");
console.log("🚀 Admin login successful");
```

---

## 🚀 **Deployment Checklist**

### **🔥 Production Setup**

- [ ] Set strong `ADMIN_EMAIL` in production environment
- [ ] Set complex `ADMIN_PASSWORD` (min 16 characters)
- [ ] Verify JWT_SECRET is different from development
- [ ] Ensure `.env` file is not in version control
- [ ] Test admin login functionality
- [ ] Verify admin routes are protected

### **🔒 Security Verification**

- [ ] Admin password follows complexity requirements
- [ ] Admin email is organization-controlled
- [ ] JWT tokens have appropriate expiry times
- [ ] Rate limiting is enabled for login endpoints
- [ ] HTTPS is enforced in production
- [ ] Admin actions are logged

---

## 🎯 **Usage Instructions**

### **👤 For Administrators**

1. Navigate to the login page
2. Click "Admin Access" button
3. Enter your admin email and password
4. Click "Sign in as Admin"
5. You'll be redirected to the admin dashboard

### **👥 For Regular Users**

- No change - continue using "Continue with Microsoft" button
- Admin access is separate and doesn't affect user experience

---

## 🔧 **Development & Testing**

### **🧪 Test Admin Login**

```bash
# Using curl
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@exctel.com",
    "password": "SuperSecureAdminPassword123!"
  }'
```

### **🔍 Verify Token**

```bash
# Test the returned token
curl -X POST http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

---

## ⚠️ **Important Notes**

### **🔒 Security Considerations**

- Admin credentials are stored in environment variables (not database)
- This is intentional for bootstrapping and emergency access
- Consider implementing 2FA for production admin access
- Regularly rotate admin passwords
- Monitor admin login attempts and failed attempts

### **🎯 Future Enhancements**

- **Multi-factor Authentication (MFA)** for admin login
- **Admin user management** in database with role hierarchy
- **Session management** with admin activity tracking
- **IP restrictions** for admin access
- **Admin password reset** functionality

---

## 🆘 **Troubleshooting**

### **❌ "Admin authentication not configured"**

**Solution**: Add `ADMIN_EMAIL` and `ADMIN_PASSWORD` to your `.env` file

### **❌ "Invalid admin credentials"**

**Solution**: Verify email/password match exactly what's in `.env`

### **❌ Network errors**

**Solution**: Ensure backend server is running on correct port

### **❌ Token verification fails**

**Solution**: Check `JWT_SECRET` is consistent across requests

---

✅ **The admin login system provides secure, independent access for system administrators while maintaining the SSO experience for regular users.**
