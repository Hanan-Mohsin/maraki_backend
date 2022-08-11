
const Joi = require('joi');
const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
    name:{
        type: String,
        minlength: 3,
        maxlength: 255,
        required: true
    }
});

const Branch = mongoose.model('Branch', branchSchema);

function validateBranch(branch){
    const schema = Joi.object({
        name: Joi.string().min(3).max(255).required(),
    });

    return schema.validate(branch);
}

module.exports.Branch = Branch;
module.exports.validate = validateBranch;