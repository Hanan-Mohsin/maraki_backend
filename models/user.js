const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        minlength: 3,
        maxlength: 50,
        required: true
    },
    lastName: {
        type: String,
        minlength: 3,
        maxlength: 50,
        required: true
    },
    email: {
		type: String,
		minlength: 5,
		maxlength:255,
        required: true,
		unique: true,
	},
	phoneNumber: {
		type: String,
		unique: true,
		minlength: 10,
		required: true,
		//maxlength: 10
	}, 	
	password: {
		type:String,
		required: true,
		minlength: 8,
		maxlength: 1024
	},
	date: {
        type: Date,
        default: Date.now
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isAgent: {
        type: Boolean,
        default: false
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true,
    },
    
    isDeleted: {
        type: Boolean,
        default: false
    }
});

userSchema.methods.generateAuthToken = function(){
	const token = jwt.sign({_id:this._id, isAdmin: this.isAdmin,isAgent: this.isAgent},config.get('jwtPrivateKey'));
	return token;
}

const User = mongoose.model('User',userSchema);

function validateUser(user){
    const schema = Joi.object({
        firstName: Joi.string().min(3).max(50).required(),
        lastName: Joi.string().min(3).max(50).required(),
        phoneNumber: Joi.string().min(10).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(8).max(255).required(),
		date: Joi.date(),
        isAdmin: Joi.boolean(),
        isAgent: Joi.boolean(),
        branch: Joi.objectId().required(),
        isDeleted: Joi.boolean()

    });

    return schema.validate(user);
}

module.exports.User = User;
module.exports.validate = validateUser;

//agent eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MmRjNTlhYzVmNjkyMjIwNmMxMjRmY2MiLCJpc0FkbWluIjpmYWxzZSwiaXNBZ2VudCI6dHJ1ZSwiaWF0IjoxNjU4NjA4MDQ0fQ.NSmzxnDW9w63M3piIvZE3skfE25pbSehV19ENRcIVrM

//admin eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MmRjNWE0NWI4NmMxMTEwZDQxOGZkZGMiLCJpc0FkbWluIjp0cnVlLCJpc0FnZW50Ijp0cnVlLCJpYXQiOjE2NTg2MDgxOTh9.Zm2LXV0N5ozlbu71vwTZe930ly0Xb-e6GtfdvgNHgFM