const { createNotification, numOfUnreadNotification, markAsViewed, allNotification } = require('../models/notification');
const validate= require('../models/notification').validate;
const mongoose = require('mongoose');

// const io;
var socket;
var NotificationSocket = function (io, socket) {
    this.io = io;
    socket = socket;

    // Expose handler methods for events
    this.handler = {
        notification: notification.bind(this), // use the bind function to access this.io   // and this.socket in events
        viewed: viewed.bind(this),
        'get unread count': getUnreadCount.bind(this),
    };
}

async function notification(io,notification) {
    
    const newNotification = await createNotification(notification);

   
    io.to(newNotification.user).emit('new notification', newNotification);

    // send number of unread notification to user
    const count = await numOfUnreadNotification(newNotification.user);
    const notifications = await allNotification(newNotification.user);
    
    io.to(newNotification.user).emit('unread notification count', count);
    io.to(newNotification.user).emit('all notification', notifications);
    
    return newNotification;

};

async function viewed(io, userId,notificationId) {

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return  io.to(userId).emit('error','A notification with this id is not found.');
    }

    const notification = await markAsViewed(notificationId, userId);

	if(!notification) return  io.to(userId).emit('error','A notification with this id is not found.');
	
    io.to(userId).emit('viewed notification', notification);

    const count = await numOfUnreadNotification(userId);
    const notifications = await allNotification(userId);
	
    io.to(userId).emit('unread notification count', count);
	io.to(userId).emit('all notification', notifications);
	return notification;
}

async function getUnreadCount(io, socket) {
    
    const count = await numOfUnreadNotification(socket.id);
	const notifications = await allNotification(socket.id);
	
    io.to(socket.id).emit('unread notification count', count);
	io.to(socket.id).emit('all notification', notifications);
}



module.exports = {
    NotificationSocket: NotificationSocket,
    notification: notification,
    viewed: viewed,
    getUnreadCount : getUnreadCount
}