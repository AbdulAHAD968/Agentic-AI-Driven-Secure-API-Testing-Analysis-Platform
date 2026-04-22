
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');


const JWT_SECRET = process.env.JWT_SECRET || 'a-very-long-and-random-internal-fallback-secret';


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

router.post('/api/auth/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body;
    
    
    const user = await findUserByEmail(email); 
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    
    const token = jwt.sign(
        { id: user.id, role: user.role }, 
        JWT_SECRET, 
        { expiresIn: '1h' }
    );

    res.json({ success: true, token });
});

module.exports = router;
