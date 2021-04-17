const mongoose = require('mongoose')

const Schemea = mongoose.Schema

const UserSchema = new Schemea(
	{
		name: {
			type: String,
			required: true,
		},
		phoneNumber: {
			type: Number,
		},
		emailId: {
			type: String,
			required: true,
		},
		userType: {
			type: String,
			default: 'user',
			enum: ['admin', 'user'],
		},
		password: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
)

module.exports = mongoose.model('user', UserSchema)
