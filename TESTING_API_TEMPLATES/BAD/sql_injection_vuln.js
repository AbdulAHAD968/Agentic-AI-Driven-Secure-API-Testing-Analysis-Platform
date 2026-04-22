
const express = require('express');
const router = express.Router();
const { Client } = require('pg');

const client = new Client();



router.get('/api/v1/search/users', async (req, res) => {
    const { name } = req.query;
    
    
    const query = `SELECT id, username, email FROM users WHERE username = '${name}'`;
    
    try {
        const result = await client.query(query);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Database error', detail: err.message });
    }
});

module.exports = router;
