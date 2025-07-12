const QRCode = require('qrcode');
const User = require('../user/user.model');
const Analytics = require('../analytics/analytics.model');
const logger = require('../../config/logger');

/**
 * @desc    Generate QR code for user card
 * @route   GET /api/cards/:userId/qr
 * @access  Public
 */
exports.generateQR = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { size = 256, format = 'png' } = req.query;

        const user = await User.findById(userId).populate('company');

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

        // Generate card URL
        const cardUrl = `${process.env.FRONTEND_URL}/card/${user.company.slug}/${user._id}`;

        // QR code options
        const options = {
            width: parseInt(size),
            margin: 2,
            color: {
                dark: user.company.primaryColor || '#000000',
                light: '#FFFFFF'
            }
        };

        let qrData;

        if (format === 'svg') {
            qrData = await QRCode.toString(cardUrl, { ...options, type: 'svg' });
            res.set('Content-Type', 'image/svg+xml');
        } else {
            qrData = await QRCode.toDataURL(cardUrl, options);
            res.set('Content-Type', 'image/png');
        }

        // Record analytics event
        await Analytics.recordEvent({
            user: user._id,
            company: user.company._id,
            eventType: 'qr_scan',
            visitorInfo: {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                device: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop'
            },
            metadata: {
                format,
                size
            }
        });

        if (format === 'svg') {
            res.send(qrData);
        } else {
            // Convert data URL to buffer and send
            const base64Data = qrData.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            res.send(buffer);
        }
    } catch (error) {
        logger.error('Generate QR error:', error);
        next(error);
    }
};

/**
 * @desc    Generate vCard for contact download
 * @route   GET /api/cards/:userId/vcard
 * @access  Public
 */
exports.generateVCard = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).populate('company');

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

        // Generate vCard content
        const vCardLines = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${user.fullName}`,
            `N:${user.lastName};${user.firstName};;;`,
            `EMAIL:${user.email}`
        ];

        if (user.jobTitle) {
            vCardLines.push(`TITLE:${user.jobTitle}`);
        }

        if (user.company && user.company.name) {
            vCardLines.push(`ORG:${user.company.name}`);
        }

        if (user.phoneNumber) {
            vCardLines.push(`TEL:${user.phoneNumber}`);
        }

        if (user.company && user.company.website) {
            vCardLines.push(`URL:${user.company.website}`);
        }

        if (user.company && user.company.fullAddress) {
            vCardLines.push(`ADR:;;${user.company.fullAddress.replace(/,/g, ';')};;;`);
        }

        // Add social links as URLs
        if (user.socialLinks) {
            if (user.socialLinks.linkedin) {
                vCardLines.push(`URL;TYPE=LinkedIn:${user.socialLinks.linkedin}`);
            }
            if (user.socialLinks.twitter) {
                vCardLines.push(`URL;TYPE=Twitter:${user.socialLinks.twitter}`);
            }
            if (user.socialLinks.website) {
                vCardLines.push(`URL;TYPE=Website:${user.socialLinks.website}`);
            }
        }

        // Add card URL
        const cardUrl = `${process.env.FRONTEND_URL}/card/${user.company.slug}/${user._id}`;
        vCardLines.push(`URL;TYPE=DigitalCard:${cardUrl}`);

        vCardLines.push('END:VCARD');

        const vCardContent = vCardLines.join('\r\n');

        // Record analytics event
        await Analytics.recordEvent({
            user: user._id,
            company: user.company._id,
            eventType: 'contact_download',
            visitorInfo: {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                device: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop'
            },
            metadata: {
                downloadFormat: 'vcard'
            }
        });

        res.set({
            'Content-Type': 'text/vcard',
            'Content-Disposition': `attachment; filename="${user.fullName.replace(/[^a-zA-Z0-9]/g, '_')}.vcf"`
        });

        res.send(vCardContent);
    } catch (error) {
        logger.error('Generate vCard error:', error);
        next(error);
    }
};

/**
 * @desc    Get card by company slug and user ID
 * @route   GET /api/cards/:companySlug/:userId
 * @access  Public
 */
exports.getCardBySlug = async (req, res, next) => {
    try {
        const { companySlug, userId } = req.params;

        const user = await User.findById(userId).populate('company');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.company.slug !== companySlug) {
            return res.status(404).json({
                success: false,
                message: 'Card not found'
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
        const isCompanyMember = req.user && req.user.company && req.user.company.toString() === user.company._id.toString();
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
            },
            referrer: {
                source: req.get('Referer') || 'direct'
            }
        });

        res.status(200).json({
            success: true,
            data: {
                ...cardData,
                company: user.company.getPublicInfo(),
                cardUrl: `${process.env.FRONTEND_URL}/card/${companySlug}/${userId}`,
                qrUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/cards/${userId}/qr`,
                vCardUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/cards/${userId}/vcard`
            }
        });
    } catch (error) {
        logger.error('Get card by slug error:', error);
        next(error);
    }
};

/**
 * @desc    Record card interaction
 * @route   POST /api/cards/:userId/interaction
 * @access  Public
 */
exports.recordInteraction = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { eventType, metadata = {} } = req.body;

        const user = await User.findById(userId).populate('company');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Validate event type
        const validEvents = ['phone_click', 'email_click', 'website_click', 'social_click', 'share_card'];

        if (!validEvents.includes(eventType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid event type'
            });
        }

        // Record analytics event
        await Analytics.recordEvent({
            user: user._id,
            company: user.company._id,
            eventType,
            visitorInfo: {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                device: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop'
            },
            metadata: {
                ...metadata,
                timestamp: new Date()
            }
        });

        res.status(200).json({
            success: true,
            message: 'Interaction recorded successfully'
        });
    } catch (error) {
        logger.error('Record interaction error:', error);
        next(error);
    }
};

/**
 * @desc    Share card
 * @route   POST /api/cards/:userId/share
 * @access  Public
 */
exports.shareCard = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { method = 'link', platform } = req.body;

        const user = await User.findById(userId).populate('company');

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

        const cardUrl = `${process.env.FRONTEND_URL}/card/${user.company.slug}/${user._id}`;

        // Record analytics event
        await Analytics.recordEvent({
            user: user._id,
            company: user.company._id,
            eventType: 'share_card',
            visitorInfo: {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                device: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop'
            },
            metadata: {
                shareMethod: method,
                platform
            }
        });

        res.status(200).json({
            success: true,
            message: 'Card shared successfully',
            data: {
                cardUrl,
                shareText: `Check out ${user.fullName}'s digital business card from ${user.company.name}`,
                qrUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/cards/${userId}/qr`
            }
        });
    } catch (error) {
        logger.error('Share card error:', error);
        next(error);
    }
}; 