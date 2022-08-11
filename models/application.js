const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');



const appSchema = new mongoose.Schema({
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
    birthDate: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['male','female'],
		lowercase: true,
        required: true,
    },
    image: {
        type: String,
        required: true,
        validate: {
            validator: function(value) {
              const urlPattern = /(http|https):\/\/(\w+:{0,1}\w*#)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%#!\-/]))?/;
              const urlRegExp = new RegExp(urlPattern);
              return value.match(urlRegExp);
            },
            message: props => `${props.value} is not a valid URL`
          }
    },
	date: {
        type: Date,
        default: Date.now
    },
    level:{
        type: String,
        enum: ['degree','masters'],
		lowercase: true,
        required: true,
    },
    field: {
		type: String,
		minlength: 5,
		maxlength:255,
        required: true,
	},
    country: {
		type: String,
		minlength: 5,
		maxlength:50,
        required: true,
	},
    transcript: {
        type: String,
        required: true,
        validate: {
            validator: function(value) {
              const urlPattern = /(http|https):\/\/(\w+:{0,1}\w*#)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%#!\-/]))?/;
              const urlRegExp = new RegExp(urlPattern);
              return value.match(urlRegExp);
            },
            message: props => `${props.value} is not a valid URL`
          }
    },
    passport: {
        type: String,
        required: true,
        validate: {
            validator: function(value) {
              const urlPattern = /(http|https):\/\/(\w+:{0,1}\w*#)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%#!\-/]))?/;
              const urlRegExp = new RegExp(urlPattern);
              return value.match(urlRegExp);
            },
            message: props => `${props.value} is not a valid URL`
          }
    },
    progresses: {
        type:[{type: mongoose.Schema.Types.ObjectId, ref: 'Progress'}],  
        default: []
    },
    
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true,
    },
    aptDate: {
        type:Date
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});   

appSchema.methods.generateAuthToken = function(){
	const token = jwt.sign({_id:this._id, isAdmin: this.isAdmin},config.get('jwtPrivateKey'));
	return token;
}

const Application = mongoose.model('Application',appSchema);

function validateApplication(app){
    const schema = Joi.object({
        firstName: Joi.string().min(3).max(50).required(),
        lastName: Joi.string().min(3).max(50).required(),
        phoneNumber: Joi.string().min(10).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(8).max(255).required(),
		date: Joi.date(),
        birthDate: Joi.date().required(),
        gender: Joi.string().required(),
        image: Joi.string().required(),
        level: Joi.string().required(),
        field: Joi.string().min(5).max(255).required(),
        country: Joi.string().min(5).max(255).required(),
        transcript: Joi.string().required(),
        passport: Joi.string().required(),
        progresses: Joi.array(),
        branch: Joi.objectId().required(),
        aptDate: Joi.date(),
        isAdmin: Joi.boolean(),
        isDeleted: Joi.boolean()

    });

    return schema.validate(app);
}

module.exports.Application = Application;
module.exports.validate = validateApplication;
