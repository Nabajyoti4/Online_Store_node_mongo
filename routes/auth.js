const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();


// get login 
router.get('/login', authController.getLogin);


//post login form
router.post('/login', authController.postLogin);

module.exports = router;


