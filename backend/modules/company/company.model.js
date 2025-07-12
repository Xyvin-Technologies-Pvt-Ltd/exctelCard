const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    // Basic Company Information
    name: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
        maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },

    // Contact Information
    email: {
        type: String,
        required: [true, 'Company email is required'],
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Website must be a valid URL starting with http:// or https://'
        }
    },

    // Address
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },

    // Branding
    logo: {
        type: String,
        default: null
    },
    primaryColor: {
        type: String,
        default: '#3B82F6',
        match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color code']
    },
    secondaryColor: {
        type: String,
        default: '#64748B',
        match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color code']
    },

    // Social Media
    socialLinks: {
        linkedin: String,
        twitter: String,
        facebook: String,
        instagram: String,
        youtube: String
    },

    // Card Configuration
    cardTemplate: {
        type: String,
        enum: ['modern', 'classic', 'minimal', 'corporate'],
        default: 'modern'
    },
    cardFeatures: {
        showLogo: {
            type: Boolean,
            default: true
        },
        showAddress: {
            type: Boolean,
            default: true
        },
        showSocialLinks: {
            type: Boolean,
            default: true
        },
        allowQRDownload: {
            type: Boolean,
            default: true
        },
        allowVCardDownload: {
            type: Boolean,
            default: true
        }
    },

    // Settings
    isActive: {
        type: Boolean,
        default: true
    },
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'basic', 'premium', 'enterprise'],
            default: 'free'
        },
        maxUsers: {
            type: Number,
            default: 10
        },
        features: [{
            type: String
        }],
        expiresAt: Date
    },

    // Analytics Settings
    analyticsEnabled: {
        type: Boolean,
        default: true
    },

    // Custom Domain
    customDomain: {
        domain: String,
        verified: {
            type: Boolean,
            default: false
        },
        verificationRecord: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full address
companySchema.virtual('fullAddress').get(function () {
    const addr = this.address;
    if (!addr) return null;

    const parts = [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
});

// Virtual for card URL
companySchema.virtual('cardBaseUrl').get(function () {
    if (this.customDomain && this.customDomain.verified) {
        return `https://${this.customDomain.domain}`;
    }
    return `${process.env.FRONTEND_URL}/card/${this.slug}`;
});

// Virtual for user count
companySchema.virtual('userCount', {
    ref: 'User',
    localField: '_id',
    foreignField: 'company',
    count: true
});

// Indexes (slug already indexed via unique: true)
companySchema.index({ name: 1 });
companySchema.index({ isActive: 1 });
companySchema.index({ 'subscription.plan': 1 });

// Pre-save middleware to generate slug
companySchema.pre('save', function (next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    }
    next();
});

// Method to check if company can add more users
companySchema.methods.canAddUsers = function (additionalUsers = 1) {
    return this.userCount + additionalUsers <= this.subscription.maxUsers;
};

// Method to get company branding
companySchema.methods.getBranding = function () {
    return {
        logo: this.logo,
        primaryColor: this.primaryColor,
        secondaryColor: this.secondaryColor,
        cardTemplate: this.cardTemplate
    };
};

// Method to get public company info
companySchema.methods.getPublicInfo = function () {
    return {
        id: this._id,
        name: this.name,
        slug: this.slug,
        description: this.description,
        website: this.website,
        logo: this.logo,
        primaryColor: this.primaryColor,
        secondaryColor: this.secondaryColor,
        socialLinks: this.socialLinks,
        address: this.fullAddress,
        cardTemplate: this.cardTemplate,
        cardFeatures: this.cardFeatures
    };
};

module.exports = mongoose.model('Company', companySchema); 