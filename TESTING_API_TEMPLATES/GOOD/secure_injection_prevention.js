
const express = require('express');
const router = express.Router();
const { Client } = require('pg');
const { spawn } = require('child_process');

const client = new Client();



router.get('/api/v1/search/users-secure', async (req, res) => {
    const { name } = req.query;
    if (!name) return res.status(400).send('Query param required');

    
    const query = 'SELECT id, username, email FROM users WHERE username = $1';
    
    try {
        const result = await client.query(query, [name]);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});



router.post('/api/v1/debug/ping-secure', (req, res) => {
    const { host } = req.body;
    
    
    if (!/^[a-zA-Z0-9.-]+$/.test(host)) {
        return res.status(400).send('Invalid host format');
    }

    
    const ping = spawn('ping', ['-c', '4', host]);

    let output = '';
    ping.stdout.on('data', (data) => {
        output += data.toString();
    });

    ping.on('close', (code) => {
        res.json({ success: true, status: code, output });
    });
});

module.exports = router;
