
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');



router.get('/api/users/:id', protect, async (req, res) => {
    try {
        if (req.user.id !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        
        const user = await User.findById(req.params.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});



router.get('/api/health', (req, res) => {
    res.json({ status: 'up', timestamp: new Date() });
});

module.exports = router;
