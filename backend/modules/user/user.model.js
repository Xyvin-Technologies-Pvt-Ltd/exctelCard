const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Basic Information
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password by default
    },

    // Profile Information
    profilePicture: {
        type: String,
        default: null
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    jobTitle: {
        type: String,
        trim: true
    },
    department: {
        type: String,
        trim: true
    },
    employeeId: {
        type: String,
        unique: true,
        sparse: true
    },

    // Company Information
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Company is required']
    },

    // Authentication
    role: {
        type: String,
        enum: ['employee', 'admin', 'super_admin'],
        default: 'employee'
    },
    authProvider: {
        type: String,
        enum: ['local', 'google', 'microsoft'],
        default: 'local'
    },
    googleId: {
        type: String,
        sparse: true
    },
    microsoftId: {
        type: String,
        sparse: true
    },

    // Account Status
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Password Reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Timestamps
    lastLogin: {
        type: Date,
        default: null
    },

    // Card Access
    hasCardAccess: {
        type: Boolean,
        default: true
    },
    cardSettings: {
        isPublic: {
            type: Boolean,
            default: false
        },
        allowDirectContact: {
            type: Boolean,
            default: true
        },
        showSocialLinks: {
            type: Boolean,
            default: true
        }
    },

    // Social Links
    socialLinks: {
        linkedin: String,
        twitter: String,
        github: String,
        website: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Index for search optimization (email and employeeId already indexed via unique: true)
userSchema.index({ company: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash password if it's modified or new
    if (!this.isModified('password')) return next();

    // Hash password
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = function () {
    this.lastLogin = new Date();
    return this.save();
};

// Check if user can access card features
userSchema.methods.canAccessCard = function () {
    return this.isActive && this.hasCardAccess;
};

// Get user's card data
userSchema.methods.getCardData = function () {
    return {
        id: this._id,
        fullName: this.fullName,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        jobTitle: this.jobTitle,
        department: this.department,
        profilePicture: this.profilePicture,
        phoneNumber: this.phoneNumber,
        company: this.company,
        socialLinks: this.socialLinks,
        cardSettings: this.cardSettings
    };
};

module.exports = mongoose.model('User', userSchema); 