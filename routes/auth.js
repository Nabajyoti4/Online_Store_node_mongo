const express = require('express');
const {check,  body} = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();


// get login 
router.get('/login', authController.getLogin);


//post login form
router.post('/login',[
    check('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
    body('password', 'Password must be valid')
    .isLength({min : 5})
    .isAlphanumeric()
    .trim()
], authController.postLogin);

//logout route
router.post('/logout', authController.postLogout);


//signup page
router.get('/signup', authController.getSignup);

//signup the user post
router.post('/signup',
[
    check('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .custom((value , {req}) => {
        return User.findOne({
            email: req.body.email,
          })
            .then((userDoc) => {
              if (userDoc) {
                  return Promise.reject('Email exists already')
              }
            })
    })
    .normalizeEmail(),

    body('password', 'Please enter number or text of least 5 char')
    .isLength({min : 5})
    .isAlphanumeric()
    .trim(),

    body('confirmPassword')
    .custom((
        value, {req}) => {
            if (value !== req.body.password){
                throw new Error('Passwords have to match')
            }
            return true;
        }
    ) 
]
    , authController.postSignup);

// get reset page
router.get('/reset', authController.getReset);

//post rest 
router.post('/reset', authController.postReset);

//get password reset page
router.get('/reset/:token', authController.getNewPassword);

//set new password
router.post('/new-password', authController.postNewPassword);
module.exports = router;


