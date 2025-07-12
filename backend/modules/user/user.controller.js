const User = require('./user.model');
const Company = require('../company/company.model');
const Analytics = require('../analytics/analytics.model');
const logger = require('../../config/logger');

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build query based on user role
        let query = {};

        if (req.user.role === 'admin') {
            // Admin can only see users from their company
            query.company = req.user.company;
        } else if (req.user.role === 'super_admin') {
            // Super admin can see all users or filter by company
            if (req.query.company) {
                query.company = req.query.company;
            }
        }

        // Additional filters
        if (req.query.role) {
            query.role = req.query.role;
        }

        if (req.query.isActive !== undefined) {
            query.isActive = req.query.isActive === 'true';
        }

        if (req.query.hasCardAccess !== undefined) {
            query.hasCardAccess = req.query.hasCardAccess === 'true';
        }

        // Search functionality
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query.$or = [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { email: searchRegex },
                { employeeId: searchRegex }
            ];
        }

        const users = await User.find(query)
            .populate('company', 'name slug logo')
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: users
        });
    } catch (error) {
        logger.error('Get users error:', error);
        next(error);
    }
};

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private
 */
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('company', 'name slug logo primaryColor secondaryColor')
            .select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check permissions
        if (req.user.role === 'employee' && req.user.id !== user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (req.user.role === 'admin' && user.company.toString() !== req.user.company.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        logger.error('Get user error:', error);
        next(error);
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/:id
 * @access  Private
 */
exports.updateUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const updateData = { ...req.body };

        // Remove sensitive fields that shouldn't be updated via this endpoint
        delete updateData.password;
        delete updateData.role;
        delete updateData.company;
        delete updateData.googleId;
        delete updateData.microsoftId;
        delete updateData.authProvider;

        // Check permissions
        if (req.user.role === 'employee' && req.user.id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (req.user.role === 'admin') {
            const targetUser = await User.findById(userId);
            if (!targetUser || targetUser.company.toString() !== req.user.company.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate('company', 'name slug logo');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Record analytics event for profile update
        await Analytics.recordEvent({
            user: user._id,
            company: user.company._id,
            eventType: 'profile_update',
            metadata: {
                updatedBy: req.user.id,
                updatedFields: Object.keys(updateData)
            }
        });

        logger.info(`User profile updated: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        logger.error('Update user error:', error);
        next(error);
    }
};

/**
 * @desc    Toggle user card access
 * @route   PUT /api/users/:id/card-access
 * @access  Private/Admin
 */
exports.toggleCardAccess = async (req, res, next) => {
    try {
        const { hasCardAccess } = req.body;
        const userId = req.params.id;

        // Check permissions
        if (req.user.role === 'employee') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Admin can only modify users from their company
        if (req.user.role === 'admin' && user.company.toString() !== req.user.company.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        user.hasCardAccess = hasCardAccess;
        await user.save();

        logger.info(`Card access ${hasCardAccess ? 'granted' : 'revoked'} for user: ${user.email}`);

        res.status(200).json({
            success: true,
            message: `Card access ${hasCardAccess ? 'granted' : 'revoked'} successfully`,
            data: {
                id: user._id,
                email: user.email,
                hasCardAccess: user.hasCardAccess
            }
        });
    } catch (error) {
        logger.error('Toggle card access error:', error);
        next(error);
    }
};

/**
 * @desc    Get user's card data
 * @route   GET /api/users/:id/card
 * @access  Public (with optional auth)
 */
exports.getUserCard = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('company');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.canAccessCard()) {
            return res.status(403).json({
                success: false,
                message: 'Card access denied'
            });
        }

        // Check if card is public or user has access
        const isOwner = req.user && req.user.id === user.id;
        const isCompanyMember = req.user && req.user.company.toString() === user.company._id.toString();
        const isPublic = user.cardSettings.isPublic;

        if (!isPublic && !isOwner && !isCompanyMember) {
            return res.status(403).json({
                success: false,
                message: 'This card is private'
            });
        }

        // Get card data
        const cardData = user.getCardData();

        // Record analytics event
        await Analytics.recordEvent({
            user: user._id,
            company: user.company._id,
            eventType: 'card_view',
            visitorInfo: {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                device: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop'
            }
        });

        res.status(200).json({
            success: true,
            data: {
                ...cardData,
                company: user.company.getPublicInfo()
            }
        });
    } catch (error) {
        logger.error('Get user card error:', error);
        next(error);
    }
};

/**
 * @desc    Update user card settings
 * @route   PUT /api/users/:id/card-settings
 * @access  Private
 */
exports.updateCardSettings = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { cardSettings } = req.body;

        // Check permissions
        if (req.user.role === 'employee' && req.user.id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { cardSettings },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Card settings updated successfully',
            data: {
                cardSettings: user.cardSettings
            }
        });
    } catch (error) {
        logger.error('Update card settings error:', error);
        next(error);
    }
};

/**
 * @desc    Get user analytics
 * @route   GET /api/users/:id/analytics
 * @access  Private
 */
exports.getUserAnalytics = async (req, res, next) => {
    try {
        const userId = req.params.id;

        // Check permissions
        if (req.user.role === 'employee' && req.user.id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (req.user.role === 'admin') {
            const targetUser = await User.findById(userId);
            if (!targetUser || targetUser.company.toString() !== req.user.company.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
        }

        const dateRange = {
            startDate: req.query.startDate,
            endDate: req.query.endDate
        };

        const analytics = await Analytics.getUserAnalytics(userId, dateRange);

        res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (error) {
        logger.error('Get user analytics error:', error);
        next(error);
    }
};

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;

        // Check permissions
        if (req.user.role === 'employee') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Admin can only delete users from their company
        if (req.user.role === 'admin' && user.company.toString() !== req.user.company.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Cannot delete super admin
        if (user.role === 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete super admin'
            });
        }

        await User.findByIdAndDelete(userId);

        logger.info(`User deleted: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: {}
        });
    } catch (error) {
        logger.error('Delete user error:', error);
        next(error);
    }
}; 