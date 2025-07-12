const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../user/user.model');
const Company = require('../company/company.model');
const logger = require('../../config/logger');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);

    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    };

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            message: 'Authentication successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                company: user.company,
                hasCardAccess: user.hasCardAccess,
                profilePicture: user.profilePicture
            }
        });
};

/**
 * @desc    Admin login with email and password
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for user and include password field
        const user = await User.findOne({ email }).select('+password').populate('company');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is admin or super admin
        if (!['admin', 'super_admin'].includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Update last login
        await user.updateLastLogin();

        logger.info(`Admin login successful: ${user.email}`);
        sendTokenResponse(user, 200, res);
    } catch (error) {
        logger.error('Login error:', error);
        next(error);
    }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate('company');

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                company: user.company,
                hasCardAccess: user.hasCardAccess,
                profilePicture: user.profilePicture,
                lastLogin: user.lastLogin,
                cardSettings: user.cardSettings,
                socialLinks: user.socialLinks
            }
        });
    } catch (error) {
        logger.error('Get me error:', error);
        next(error);
    }
};

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
    try {
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
            data: {}
        });
    } catch (error) {
        logger.error('Logout error:', error);
        next(error);
    }
};

/**
 * @desc    Google OAuth callback
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
exports.googleCallback = async (req, res) => {
    try {
        const user = req.user;
        await user.updateLastLogin();

        logger.info(`Google SSO login: ${user.email}`);

        // Generate token and redirect to frontend
        const token = generateToken(user._id);

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        }))}`);
    } catch (error) {
        logger.error('Google callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=sso_failed`);
    }
};

/**
 * @desc    Microsoft OAuth callback
 * @route   GET /api/auth/microsoft/callback
 * @access  Public
 */
exports.microsoftCallback = async (req, res) => {
    try {
        const user = req.user;
        await user.updateLastLogin();

        logger.info(`Microsoft SSO login: ${user.email}`);

        // Generate token and redirect to frontend
        const token = generateToken(user._id);

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        }))}`);
    } catch (error) {
        logger.error('Microsoft callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=sso_failed`);
    }
};

/**
 * @desc    Create super admin account
 * @route   POST /api/auth/create-super-admin
 * @access  Public (only if no super admin exists)
 */
exports.createSuperAdmin = async (req, res, next) => {
    try {
        // Check if super admin already exists
        const existingSuperAdmin = await User.findOne({ role: 'super_admin' });

        if (existingSuperAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Super admin already exists'
            });
        }

        const { email, password, firstName, lastName, companyName } = req.body;

        // Validate input
        if (!email || !password || !firstName || !lastName || !companyName) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Create company first
        const company = new Company({
            name: companyName,
            email: email,
            slug: companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        });

        await company.save();

        // Create super admin user
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            role: 'super_admin',
            company: company._id,
            isActive: true,
            isEmailVerified: true,
            authProvider: 'local'
        });

        await user.save();

        logger.info(`Super admin created: ${user.email}`);

        sendTokenResponse(user, 201, res);
    } catch (error) {
        logger.error('Create super admin error:', error);
        next(error);
    }
};

/**
 * @desc    Refresh token
 * @route   POST /api/auth/refresh
 * @access  Private
 */
exports.refreshToken = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        logger.error('Refresh token error:', error);
        next(error);
    }
}; 