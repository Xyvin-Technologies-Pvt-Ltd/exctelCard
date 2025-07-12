const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ExcelCard API',
            version: '1.0.0',
            description: 'API for digital business card system with employee SSO and admin management',
            contact: {
                name: 'API Support',
                email: 'support@excelcard.com'
            }
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production'
                    ? 'https://api.excelcard.com'
                    : 'http://localhost:5000',
                description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        role: { type: 'string', enum: ['employee', 'admin', 'super_admin'] },
                        company: { type: 'string' },
                        hasCardAccess: { type: 'boolean' },
                        isActive: { type: 'boolean' },
                        profilePicture: { type: 'string', format: 'uri' },
                        jobTitle: { type: 'string' },
                        department: { type: 'string' },
                        phoneNumber: { type: 'string' },
                        socialLinks: {
                            type: 'object',
                            properties: {
                                linkedin: { type: 'string', format: 'uri' },
                                twitter: { type: 'string', format: 'uri' },
                                github: { type: 'string', format: 'uri' },
                                website: { type: 'string', format: 'uri' }
                            }
                        },
                        cardSettings: {
                            type: 'object',
                            properties: {
                                isPublic: { type: 'boolean' },
                                allowDirectContact: { type: 'boolean' },
                                showSocialLinks: { type: 'boolean' }
                            }
                        }
                    }
                },
                Company: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        slug: { type: 'string' },
                        description: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        website: { type: 'string', format: 'uri' },
                        logo: { type: 'string', format: 'uri' },
                        primaryColor: { type: 'string', pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$' },
                        secondaryColor: { type: 'string', pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$' }
                    }
                },
                Analytics: {
                    type: 'object',
                    properties: {
                        user: { type: 'string' },
                        company: { type: 'string' },
                        eventType: {
                            type: 'string',
                            enum: ['card_view', 'contact_download', 'phone_click', 'email_click', 'website_click', 'social_click', 'qr_scan', 'share_card', 'profile_update']
                        },
                        timestamp: { type: 'string', format: 'date-time' },
                        visitorInfo: {
                            type: 'object',
                            properties: {
                                ipAddress: { type: 'string' },
                                device: { type: 'string', enum: ['desktop', 'mobile', 'tablet', 'unknown'] },
                                country: { type: 'string' },
                                city: { type: 'string' }
                            }
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        stack: { type: 'string' }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string' },
                        data: { type: 'object' }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication and authorization'
            },
            {
                name: 'Users',
                description: 'User management operations'
            },
            {
                name: 'Cards',
                description: 'Digital business card operations'
            },
            {
                name: 'Analytics',
                description: 'Analytics and reporting'
            }
        ]
    },
    apis: [
        './modules/auth/auth.route.js',
        './modules/user/user.route.js',
        './modules/card/card.route.js',
        './modules/analytics/analytics.route.js'
    ]
};

const specs = swaggerJsdoc(options);

module.exports = specs; 