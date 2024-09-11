const express = require('express')
const loginLimiter = require('../middleware/loginLimiter')
const router = express.Router()
const authController = require('../controllers/authController')



router.route('/')

.post(loginLimiter , authController.login)
// When a POST request is made to '/', the loginLimiter middleware is executed first.


router.route('/refresh')
.get(authController.refresh)


router.route('/logout')
.post(authController.logout)



module.exports = router