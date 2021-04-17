const { check, validationResult } = require('express-validator')
const User = require('../model/User')

const mongoose = require('mongoose')
const config = require('config')
const fs = require('fs')

const bcrypt = require('bcrypt')
const saltRounds = 10

const jwt = require('jsonwebtoken')

function generateAccessToken(id) {
	return jwt.sign(id, config.get('jwt.TOKEN_SECRET'), {
		expiresIn: '1800s',
	})
}

exports.signUp = async (req, res) => {
	try {
		const errors = validationResult(req)

		const extractedErrors = []

		errors
			.array({ onlyFirstError: true })
			.map((err) => extractedErrors.push({ [err.param]: err.msg }))

		if (!errors.isEmpty()) {
			return res.status(422).json({
				status: 'FAILURE',
				message: extractedErrors,
			})
		}

		const { name, emailId, password, phoneNumber } = req.body
		const userList = User.aggregate(
			[
				{
					$match: { emailId: emailId },
				},
			],
			(err, result) => {
				if (err) {
					return res.status(500).send({
						status: 'Failure',
						message: 'Something went wrong',
					})
				}
				if (result.length > 0) {
					return res.status(400).send({
						status: 'Failure',
						message: 'User Already Exist',
					})
				}

				const user = new User()
				user.name = name
				user.emailId = emailId
				user.phoneNumber = phoneNumber
				user.userType = 'user'

				bcrypt.hash(password, saltRounds, function (err, hash) {
					if (err) {
						return res.status(500).send({
							status: 'Failure',
							message: 'Something went wrong',
						})
					}
					user.password = hash

					user.save((err, result) => {
						if (err) {
							return res.status(500).send({
								status: 'Failure',
								message: 'Something went wrong',
							})
						}
						return res.status(200).send({
							status: 'Success',
							message: 'User Added Successfully',
						})
					})
				})
			}
		)
	} catch (error) {
		return res.status(500).send({
			status: 'Failure',
			message: 'Internal Server Error',
			error: error,
		})
	}
}

exports.logout = async (req, res) => {
	// req.session.destroy(function (err) {
	// 	return res.status(200).send({
	// 		status: 'SUCCESS',
	// 		message: 'User Log Out Successdully',
	// 	})
	// })
}

exports.login = async (req, res) => {
	try {
		const errors = validationResult(req)

		const extractedErrors = []

		errors
			.array({ onlyFirstError: true })
			.map((err) => extractedErrors.push({ [err.param]: err.msg }))

		if (!errors.isEmpty()) {
			return res.status(422).json({
				status: 'FAILURE',
				message: extractedErrors,
			})
		}

		const { emailId, password } = req.body

		const userList = await User.findOne({
			emailId: emailId,
			userType: 'user',
		}).lean()

		if (!userList) {
			return res.status(404).send({
				status: 'Failure',
				message: 'User Not Found',
			})
		}

		bcrypt.compare(password, userList.password, function (err, result) {
			if (result) {
				const { password, createdAt, updatedAt, __v, ...newResponse } = userList

				const token = generateAccessToken({ id: newResponse._id })

				return res.status(200).send({
					status: 'Success',
					message: 'User Sucessfully Login',
					data: newResponse,
					token: token,
				})
			}
			// return res.status(400).send({
			// 	status: 'Failure',
			// 	message: 'EmailId or Password is wrong',
			// 	err: err,
			// })
		})
	} catch (err) {
		return res.status(500).send({
			status: 'Failure',
			message: 'Internal Server Error',
			err: err,
		})
	}
}
