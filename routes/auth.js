const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();


// get login 
router.get('/login', authController.getLogin);


//post login form
router.post('/login', authController.postLogin);

//logout route
router.post('/logout', authController.postLogout);


//signup page
router.get('/signup', authController.getSignup);

//signup the user post
router.post('/signup', authController.postSignup);

// get reset page
router.get('/reset', authController.getReset);

//post rest 
router.post('/reset', authController.postReset);

//get password reset page
router.get('/reset/:token', authController.getNewPassword);

//set new password
router.post('/new-password', authController.postNewPassword);
module.exports = router;


