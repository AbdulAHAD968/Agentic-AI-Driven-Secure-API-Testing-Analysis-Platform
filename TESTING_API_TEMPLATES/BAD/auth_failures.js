
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');



const JWT_SECRET = '123456'; 

router.post('/api/auth/login-insecure', (req, res) => {
    const { username, password } = req.body;
    
    
    
    if (username === 'admin' && password === 'admin123') {
        const token = jwt.sign({ id: 'admin_id' }, JWT_SECRET);
        return res.json({ token });
    }
    res.status(401).send('Failure');
});



router.post('/api/auth/forgot-password', (req, res) => {
    res.send('Password reset link sent (Insecurely)');
});

module.exports = router;
