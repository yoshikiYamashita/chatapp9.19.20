const { Router } = require('express');
const userController = require('../controllers/userController');

const router = Router();

router.get('/user/:userId', userController.user_get);

router.delete('/deleteUser', userController.delete_user);

module.exports = router;