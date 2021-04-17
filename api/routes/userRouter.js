const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')

const userController = require('../controller/userController')
const config = require('config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (token == null) return res.sendStatus(401)

	jwt.verify(token, config.get('jwt.TOKEN_SECRET'), (err, user) => {
		console.log(err)

		if (err) return res.sendStatus(403)

		req.user = user

		next()
	})
}

router.post(
	'/signup',
	[check('emailId', 'emailId is required').isEmail()],
	[check('name', 'name is required').notEmpty()],
	check('phoneNumber', 'phoneNumber is required').isLength({
		min: 10,
		max: 10,
	}),
	[check('password', 'password is required').notEmpty()],
	userController.signUp
)
router.post(
	'/login',
	[check('emailId', 'emailId is required').isEmail()],
	[check('password', 'password is required').notEmpty()],
	userController.login
)

router.get('/', authenticateToken, (req, res) =>
	res.status(200).send({
		status: 'success',
		user: req.user,
	})
)

router.post('/logout', async (req, res) => {
	let randomNumberToAppend = toString(Math.floor(Math.random() * 1000 + 1))
	let randomIndex = Math.floor(Math.random() * 10 + 1)
	let hashedRandomNumberToAppend = await bcrypt.hash(randomNumberToAppend, 10)

	// now just concat the hashed random number to the end of the token
	req.token = req.token + hashedRandomNumberToAppend
	return res.status(200).json('logout')
})

// router.post('/logout', userController.logout)

module.exports = router
