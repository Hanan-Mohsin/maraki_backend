const Joi = require('joi');
const mongoose = require('mongoose');



const messSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    
    sender:{
        type: String,
        enum: ['student','admin'],
		lowercase: true,
        required: true,
    },
	date: {
        type: Date,
        default: Date.now
    },
    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true,
    },
    viewed: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});



const Message = mongoose.model('Message',messSchema);

function validateMessage(mess){
    const schema = Joi.object({
        content: Joi.string().required(),
        
		date: Joi.date(),
        sender: Joi.string().required(),
        user: Joi.objectId().required(),
        viewed: Joi.boolean(),
        isDeleted: Joi.boolean()

    });

    return schema.validate(mess);
}

async function createMessage(message) {
 
    const newMessage = new Message({
        content: message.content,
        sender: message.sender,
        user: message.user,
    });
  
    await newMessage.save();

    return newMessage;
    
}

async function numOfUnreadMessage(userId,who){
    let count = 0;
    if(who == "student"){
        count = await Message.countDocuments({
            user: userId,
            viewed: false,
            sender: "student"
    
        });
    }else{
        count = await Message.countDocuments({
            user: userId,
            viewed: false,
            sender: "admin"
        });
    }
   

    return count;
}

async function allMessages(userId){

    const messages = await Message.find({user: userId});

    return messages;
}

async function markAsViewed(messId){
    const message = await Message.findOneAndUpdate(
		{_id:messId,viewed: false},
        { viewed: true },
        { new: true }
    );
	

    return message;
 }

 module.exports = {
    Message: Message,
    validate: validateMessage,
    createMessage: createMessage,
    numOfUnreadMessage: numOfUnreadMessage,
    markAsViewed: markAsViewed ,
    allMessages: allMessages

}

