const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    // User whose card was viewed/interacted with
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Company context
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },

    // Event Information
    eventType: {
        type: String,
        enum: [
            'card_view',          // Card was viewed
            'contact_download',   // Contact info downloaded (vCard)
            'phone_click',        // Phone number clicked
            'email_click',        // Email clicked
            'website_click',      // Website/company link clicked
            'social_click',       // Social media link clicked
            'qr_scan',           // QR code scanned
            'share_card',        // Card was shared
            'profile_update'     // User updated their profile
        ],
        required: true
    },

    // Visitor Information
    visitorInfo: {
        ipAddress: String,
        userAgent: String,
        country: String,
        city: String,
        device: {
            type: String,
            enum: ['desktop', 'mobile', 'tablet', 'unknown'],
            default: 'unknown'
        },
        browser: String,
        os: String
    },

    // Referrer Information
    referrer: {
        source: String,      // Domain or source
        medium: String,      // direct, social, email, etc.
        campaign: String     // UTM campaign if present
    },

    // Additional Event Data
    metadata: {
        socialPlatform: String,    // For social_click events
        linkUrl: String,           // For website_click events
        downloadFormat: String,    // For contact_download events
        shareMethod: String,       // For share_card events
        previousPage: String,      // For navigation tracking
        sessionId: String,         // Session identifier
        viewDuration: Number       // Time spent viewing (seconds)
    },

    // Geolocation (optional)
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    },

    // Timestamps
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false // Using custom timestamp field
});

// Indexes for efficient querying
analyticsSchema.index({ user: 1, timestamp: -1 });
analyticsSchema.index({ company: 1, timestamp: -1 });
analyticsSchema.index({ eventType: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: -1 });
analyticsSchema.index({ 'visitorInfo.country': 1 });
analyticsSchema.index({ 'visitorInfo.device': 1 });

// Geospatial index for location-based queries
analyticsSchema.index({ location: '2dsphere' });

// Compound indexes for common queries
analyticsSchema.index({ user: 1, eventType: 1, timestamp: -1 });
analyticsSchema.index({ company: 1, eventType: 1, timestamp: -1 });

// Static method to record an event
analyticsSchema.statics.recordEvent = async function (eventData) {
    try {
        const event = new this(eventData);
        await event.save();
        return event;
    } catch (error) {
        console.error('Error recording analytics event:', error);
        // Don't throw error to avoid breaking the main functionality
        return null;
    }
};

// Static method to get user analytics
analyticsSchema.statics.getUserAnalytics = async function (userId, dateRange = {}) {
    const matchQuery = { user: new mongoose.Types.ObjectId(userId) };

    if (dateRange.startDate || dateRange.endDate) {
        matchQuery.timestamp = {};
        if (dateRange.startDate) matchQuery.timestamp.$gte = new Date(dateRange.startDate);
        if (dateRange.endDate) matchQuery.timestamp.$lte = new Date(dateRange.endDate);
    }

    return await this.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: '$eventType',
                count: { $sum: 1 },
                lastEvent: { $max: '$timestamp' }
            }
        },
        {
            $project: {
                eventType: '$_id',
                count: 1,
                lastEvent: 1,
                _id: 0
            }
        }
    ]);
};

// Static method to get company analytics
analyticsSchema.statics.getCompanyAnalytics = async function (companyId, dateRange = {}) {
    const matchQuery = { company: new mongoose.Types.ObjectId(companyId) };

    if (dateRange.startDate || dateRange.endDate) {
        matchQuery.timestamp = {};
        if (dateRange.startDate) matchQuery.timestamp.$gte = new Date(dateRange.startDate);
        if (dateRange.endDate) matchQuery.timestamp.$lte = new Date(dateRange.endDate);
    }

    return await this.aggregate([
        { $match: matchQuery },
        {
            $facet: {
                eventSummary: [
                    {
                        $group: {
                            _id: '$eventType',
                            count: { $sum: 1 }
                        }
                    }
                ],
                topUsers: [
                    { $match: { eventType: 'card_view' } },
                    {
                        $group: {
                            _id: '$user',
                            views: { $sum: 1 },
                            lastView: { $max: '$timestamp' }
                        }
                    },
                    { $sort: { views: -1 } },
                    { $limit: 10 },
                    {
                        $lookup: {
                            from: 'users',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'userInfo'
                        }
                    }
                ],
                deviceStats: [
                    {
                        $group: {
                            _id: '$visitorInfo.device',
                            count: { $sum: 1 }
                        }
                    }
                ],
                countryStats: [
                    {
                        $group: {
                            _id: '$visitorInfo.country',
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { count: -1 } },
                    { $limit: 10 }
                ],
                dailyStats: [
                    {
                        $group: {
                            _id: {
                                year: { $year: '$timestamp' },
                                month: { $month: '$timestamp' },
                                day: { $dayOfMonth: '$timestamp' }
                            },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
                ]
            }
        }
    ]);
};

// Static method to get trending cards
analyticsSchema.statics.getTrendingCards = async function (companyId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await this.aggregate([
        {
            $match: {
                company: new mongoose.Types.ObjectId(companyId),
                eventType: 'card_view',
                timestamp: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$user',
                views: { $sum: 1 },
                uniqueVisitors: { $addToSet: '$visitorInfo.ipAddress' }
            }
        },
        {
            $addFields: {
                uniqueVisitorCount: { $size: '$uniqueVisitors' }
            }
        },
        { $sort: { views: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userInfo'
            }
        }
    ]);
};

module.exports = mongoose.model('Analytics', analyticsSchema); 