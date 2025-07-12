const express = require('express');
const { optionalAuth } = require('../../middlewares/auth');
const {
    generateQR,
    generateVCard,
    getCardBySlug,
    recordInteraction,
    shareCard
} = require('./card.controller');

const router = express.Router();

// Public routes
router.get('/:userId/qr', generateQR);
router.get('/:userId/vcard', generateVCard);
router.get('/:companySlug/:userId', optionalAuth, getCardBySlug);
router.post('/:userId/interaction', recordInteraction);
router.post('/:userId/share', shareCard);

module.exports = router; 