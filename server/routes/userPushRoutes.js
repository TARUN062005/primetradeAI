const express = require('express');
const router = express.Router();

const pushController = require('../controller/pushController');
const { verifyToken } = require('../middleware/authmiddleware');

// user registers device token
router.post('/register', verifyToken, pushController.registerToken);

// user removes token (logout/device remove)
router.delete('/remove', verifyToken, pushController.removeToken);

module.exports = router;
