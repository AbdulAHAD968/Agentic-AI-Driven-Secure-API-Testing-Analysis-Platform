
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { exec } = require('child_process');



router.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});



router.post('/api/debug/ping', (req, res) => {
    const { host } = req.body;
    exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
        if (error) return res.status(500).send(stderr);
        res.send(stdout);
    });
});

module.exports = router;
