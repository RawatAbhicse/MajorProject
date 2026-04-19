const express = require('express');
const router = express.Router();
router.use('/treks', require('./treks'));
router.use('/guides', require('./guides'));
router.use('/weather', require('./weather'));
router.get('/', (req, res) => res.json({ message: 'Welcome to the Trekking App API!' }));
module.exports = router;