
const express = require('express');
const router = express.Router();
const User = require('../models/User');



router.get('/api/v1/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).send('Not found');

        
        const safeUser = {
            id: user._id,
            username: user.username,
            avatar: user.avatar,
            role: user.role,
            
        };

        res.json({ success: true, data: safeUser });
    } catch (err) {
        res.status(500).json({ error: 'Internal error' });
    }
});

module.exports = router;
