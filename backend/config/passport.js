const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const User = require('../modules/user/user.model');
const logger = require('./logger');

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        logger.error('Error deserializing user:', error);
        done(error, null);
    }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await User.findOne({
            $or: [
                { googleId: profile.id },
                { email: profile.emails[0].value }
            ]
        });

        if (user) {
            // Update user with Google ID if not present
            if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
            }
            return done(null, user);
        }

        // Create new user
        user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            profilePicture: profile.photos[0].value,
            role: 'employee',
            isActive: true,
            authProvider: 'google'
        });

        await user.save();
        logger.info(`New user created via Google SSO: ${user.email}`);
        done(null, user);
    } catch (error) {
        logger.error('Google OAuth error:', error);
        done(error, null);
    }
}));

// Microsoft OAuth Strategy
passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: "/api/auth/microsoft/callback",
    scope: ['user.read']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await User.findOne({
            $or: [
                { microsoftId: profile.id },
                { email: profile.emails[0].value }
            ]
        });

        if (user) {
            // Update user with Microsoft ID if not present
            if (!user.microsoftId) {
                user.microsoftId = profile.id;
                await user.save();
            }
            return done(null, user);
        }

        // Create new user
        user = new User({
            microsoftId: profile.id,
            email: profile.emails[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
            role: 'employee',
            isActive: true,
            authProvider: 'microsoft'
        });

        await user.save();
        logger.info(`New user created via Microsoft SSO: ${user.email}`);
        done(null, user);
    } catch (error) {
        logger.error('Microsoft OAuth error:', error);
        done(error, null);
    }
}));

module.exports = passport; 