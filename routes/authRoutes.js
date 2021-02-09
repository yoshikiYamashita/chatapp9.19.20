
const {Router} = require('express');

const authController = require('../controllers/authController');

const router = Router();

//get
router.get('/signup', authController.signup_get);
router.get('/login', authController.login_get);
router.get('/logout', authController.logout_get);

//post
router.post('/signup', authController.signup_post);
router.post('/login', authController.login_post);

module.exports = router;