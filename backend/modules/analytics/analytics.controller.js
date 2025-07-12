const Analytics = require('./analytics.model');
const User = require('../user/user.model');
const Company = require('../company/company.model');
const logger = require('../../config/logger');

/**
 * @desc    Get company analytics dashboard
 * @route   GET /api/analytics/dashboard
 * @access  Private/Admin
 */
exports.getDashboard = async (req, res, next) => {
    try {
        const companyId = req.user.role === 'super_admin' && req.query.company
            ? req.query.company
            : req.user.company;

        const dateRange = {
            startDate: req.query.startDate,
            endDate: req.query.endDate
        };

        // Get comprehensive analytics
        const [analyticsData] = await Analytics.getCompanyAnalytics(companyId, dateRange);

        // Get additional metrics
        const totalUsers = await User.countDocuments({
            company: companyId,
            isActive: true
        });

        const activeCardUsers = await User.countDocuments({
            company: companyId,
            hasCardAccess: true,
            isActive: true
        });

        // Get trending cards
        const trendingCards = await Analytics.getTrendingCards(companyId, 7);

        // Calculate summary metrics
        const eventSummary = analyticsData?.eventSummary || [];
        const totalViews = eventSummary.find(e => e._id === 'card_view')?.count || 0;
        const totalDownloads = eventSummary.find(e => e._id === 'contact_download')?.count || 0;
        const totalInteractions = eventSummary.reduce((sum, e) => sum + e.count, 0);

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalUsers,
                    activeCardUsers,
                    totalViews,
                    totalDownloads,
                    totalInteractions,
                    conversionRate: totalViews > 0 ? ((totalDownloads / totalViews) * 100).toFixed(2) : 0
                },
                eventSummary: analyticsData?.eventSummary || [],
                topUsers: analyticsData?.topUsers || [],
                deviceStats: analyticsData?.deviceStats || [],
                countryStats: analyticsData?.countryStats || [],
                dailyStats: analyticsData?.dailyStats || [],
                trendingCards: trendingCards || []
            }
        });
    } catch (error) {
        logger.error('Get analytics dashboard error:', error);
        next(error);
    }
};

/**
 * @desc    Get user-specific analytics
 * @route   GET /api/analytics/users/:userId
 * @access  Private
 */
exports.getUserAnalytics = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Check permissions
        if (req.user.role === 'employee' && req.user.id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const dateRange = {
            startDate: req.query.startDate,
            endDate: req.query.endDate
        };

        const analytics = await Analytics.getUserAnalytics(userId, dateRange);

        // Get recent interactions
        const recentInteractions = await Analytics.find({
            user: userId,
            ...(dateRange.startDate && { timestamp: { $gte: new Date(dateRange.startDate) } }),
            ...(dateRange.endDate && { timestamp: { $lte: new Date(dateRange.endDate) } })
        })
            .sort({ timestamp: -1 })
            .limit(50)
            .select('eventType timestamp visitorInfo metadata');

        res.status(200).json({
            success: true,
            data: {
                summary: analytics,
                recentInteractions
            }
        });
    } catch (error) {
        logger.error('Get user analytics error:', error);
        next(error);
    }
};

/**
 * @desc    Get analytics export data
 * @route   GET /api/analytics/export
 * @access  Private/Admin
 */
exports.exportAnalytics = async (req, res, next) => {
    try {
        const companyId = req.user.role === 'super_admin' && req.query.company
            ? req.query.company
            : req.user.company;

        const { startDate, endDate, format = 'json' } = req.query;

        const query = { company: companyId };

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const analytics = await Analytics.find(query)
            .populate('user', 'firstName lastName email employeeId')
            .sort({ timestamp: -1 })
            .limit(10000); // Limit for performance

        if (format === 'csv') {
            // Convert to CSV format
            const csvHeaders = [
                'Date',
                'User ID',
                'User Name',
                'User Email',
                'Event Type',
                'Device',
                'Country',
                'IP Address',
                'Metadata'
            ];

            const csvRows = analytics.map(item => [
                item.timestamp.toISOString(),
                item.user?._id || '',
                item.user ? `${item.user.firstName} ${item.user.lastName}` : '',
                item.user?.email || '',
                item.eventType,
                item.visitorInfo?.device || '',
                item.visitorInfo?.country || '',
                item.visitorInfo?.ipAddress || '',
                JSON.stringify(item.metadata || {})
            ]);

            const csvContent = [csvHeaders, ...csvRows]
                .map(row => row.map(field => `"${field}"`).join(','))
                .join('\n');

            res.set({
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="analytics_${Date.now()}.csv"`
            });

            res.send(csvContent);
        } else {
            res.status(200).json({
                success: true,
                count: analytics.length,
                data: analytics
            });
        }
    } catch (error) {
        logger.error('Export analytics error:', error);
        next(error);
    }
};

/**
 * @desc    Get real-time analytics
 * @route   GET /api/analytics/realtime
 * @access  Private/Admin
 */
exports.getRealTimeAnalytics = async (req, res, next) => {
    try {
        const companyId = req.user.role === 'super_admin' && req.query.company
            ? req.query.company
            : req.user.company;

        // Get events from last 24 hours
        const last24Hours = new Date();
        last24Hours.setHours(last24Hours.getHours() - 24);

        const recentEvents = await Analytics.find({
            company: companyId,
            timestamp: { $gte: last24Hours }
        })
            .populate('user', 'firstName lastName profilePicture')
            .sort({ timestamp: -1 })
            .limit(100);

        // Get hourly breakdown for last 24 hours
        const hourlyStats = await Analytics.aggregate([
            {
                $match: {
                    company: companyId,
                    timestamp: { $gte: last24Hours }
                }
            },
            {
                $group: {
                    _id: {
                        hour: { $hour: '$timestamp' },
                        eventType: '$eventType'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.hour': 1 }
            }
        ]);

        // Active users in last hour
        const lastHour = new Date();
        lastHour.setHours(lastHour.getHours() - 1);

        const activeUsers = await Analytics.distinct('user', {
            company: companyId,
            timestamp: { $gte: lastHour }
        });

        res.status(200).json({
            success: true,
            data: {
                recentEvents: recentEvents.slice(0, 20), // Latest 20 events
                hourlyStats,
                activeUsersCount: activeUsers.length,
                totalEventsLast24h: recentEvents.length
            }
        });
    } catch (error) {
        logger.error('Get real-time analytics error:', error);
        next(error);
    }
};

/**
 * @desc    Get analytics summary for specific date range
 * @route   GET /api/analytics/summary
 * @access  Private/Admin
 */
exports.getAnalyticsSummary = async (req, res, next) => {
    try {
        const companyId = req.user.role === 'super_admin' && req.query.company
            ? req.query.company
            : req.user.company;

        const { period = '7d' } = req.query;

        let startDate = new Date();

        switch (period) {
            case '1d':
                startDate.setDate(startDate.getDate() - 1);
                break;
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(startDate.getDate() - 90);
                break;
            default:
                startDate.setDate(startDate.getDate() - 7);
        }

        const summary = await Analytics.aggregate([
            {
                $match: {
                    company: companyId,
                    timestamp: { $gte: startDate }
                }
            },
            {
                $facet: {
                    totalsByType: [
                        {
                            $group: {
                                _id: '$eventType',
                                count: { $sum: 1 },
                                uniqueUsers: { $addToSet: '$user' }
                            }
                        },
                        {
                            $addFields: {
                                uniqueUserCount: { $size: '$uniqueUsers' }
                            }
                        },
                        {
                            $project: {
                                eventType: '$_id',
                                count: 1,
                                uniqueUserCount: 1,
                                _id: 0
                            }
                        }
                    ],
                    dailyTrend: [
                        {
                            $group: {
                                _id: {
                                    year: { $year: '$timestamp' },
                                    month: { $month: '$timestamp' },
                                    day: { $dayOfMonth: '$timestamp' }
                                },
                                count: { $sum: 1 },
                                events: { $push: '$eventType' }
                            }
                        },
                        {
                            $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
                        }
                    ]
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: summary[0] || { totalsByType: [], dailyTrend: [] }
        });
    } catch (error) {
        logger.error('Get analytics summary error:', error);
        next(error);
    }
}; 