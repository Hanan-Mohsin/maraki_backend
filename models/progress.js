const Joi = require('joi');
const mongoose = require('mongoose');



const progressSchema = new mongoose.Schema({
    content: {
        type: String,
        enum: ['agreement',
                "money is placed in the student's bank account",
                'all required document is attached',
                'process began',
                'acceptance letter is sent',
                'money is transfered',
                'embassy appointment',
                'interview',
                'accepted by the embassy',
                'training'],
		lowercase: true,
        required: true,
    },

	date: {
        type: Date,
        default: Date.now
    },
    
    status: {
        type: String,
        enum: ['pending','done','rejected'],
		lowercase: true,
        required: true,
        default:'pending'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});



const Progress = mongoose.model('Progress',progressSchema);

function validateProgress(prog){
    const schema = Joi.object({
        content: Joi.string().required(),
		date: Joi.date(),
        status: Joi.string().required(),
        isDeleted: Joi.boolean()

    });

    return schema.validate(prog);
}




 module.exports = {
    Progress: Progress,
    validate: validateProgress,
}

