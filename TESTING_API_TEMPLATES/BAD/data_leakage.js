
const express = require('express');
const router = express.Router();
const User = require('../models/User');



router.get('/api/v1/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        res.json(user); 
    } catch (err) {
        res.status(500).send('Error');
    }
});



router.get('/api/v1/system-info', (req, res) => {
    try {
        throw new Error('Database connection failed at 192.168.1.50:5432');
    } catch (err) {
        res.status(500).json({
            error: err.message,
            stack: err.stack, 
            config: process.env 
        });
    }
});

module.exports = router;
