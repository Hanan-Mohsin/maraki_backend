
const Joi = require('joi');
const mongoose = require('mongoose');

const notificationSchema  = new mongoose.Schema({
    
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
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
   date: {
        type: Date,
        default: Date.now,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
    
});

const Notification = mongoose.model('Notification', notificationSchema);

function validateNotification(notification){
    const schema = Joi.object({
        title: Joi.string().required(),
        content: Joi.string().required(),
        user: Joi.objectId().required(),
        viewed: Joi.boolean(),
        date: Joi.date(),
        isDeleted: Joi.boolean()
    });

    return schema.validate(notification);
}

async function createNotification(notification) {


    const newNotification = new Notification({
        title: notification.title,
        content: notification.content,
        user: notification.user,
    });
    await newNotification.save();

    return newNotification;
    
}

async function numOfUnreadNotification(userId){

    const count = await Notification.countDocuments({
        user: userId,
        viewed: false

    });

    return count;
}

async function allNotification(userId){

    const notifications = await Notification.find({user: userId});

    return notifications;
}

async function markAsViewed(notificationId, userId){
    const notification = await Notification.findOneAndUpdate(
		{_id:notificationId,viewed: false},
        {viewed: true},
        { new: true }
    );
	

    return notification;
 }

 module.exports = {
     Notification: Notification,
     validate: validateNotification,
     createNotification: createNotification,
     numOfUnreadNotification: numOfUnreadNotification,
     markAsViewed: markAsViewed ,
	 allNotification: allNotification

 }

