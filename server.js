const express = require('express')
const app = express()

const config = require('config')

const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const port = config.get('port.serverPort') || 4000
const MONGODB_CONNECTION_STRING = config.get('db.connection-string')

const jwt = require('jsonwebtoken')

const userRouter = require('./api/routes/userRouter')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(function (req, res, next) {
	var origin = req.headers.origin
	var allowedOrigins = ['http://localhost:3000']
	console.log('req.headers.origin', req.headers.origin)
	var origin = req.headers.origin

	if (req.method == 'OPTIONS') {
		res.header('Access-Control-Allow-Credentials', true)
		res.header('Access-Control-Request-Headers', true)
		res.setHeader('Access-Control-Allow-Origin', origin)
		res.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH')
		res.header(
			'Access-Control-Allow-Headers',
			'X-Requested-With, Content-Type, Accept, Authorization'
		)
		return res.sendStatus(200)
	} else {
		if (allowedOrigins.indexOf(origin) > -1) {
			res.header('Access-Control-Allow-Credentials', true)
			res.header('Access-Control-Request-Headers', true)
			res.setHeader('Access-Control-Allow-Origin', origin)
			res.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH')
			res.header(
				'Access-Control-Allow-Headers',
				'X-Requested-With, Content-Type, Accept, Authorization'
			)

			return next()
		}
		return next()
	}
})

app.use((request, response, next) => {
	console.log(request.session)
	console.log(request.user)
	next()
})

app.use('/api/user', userRouter)
mongoose
	.connect(MONGODB_CONNECTION_STRING, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
	})
	.then(async (res) => {
		app.listen(port, () => {
			console.log(
				'Database connection successful and Server running on port:',
				port
			)
		})
	})
	.catch((err) => console.log(err))
