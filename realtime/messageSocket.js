const { createMessage, numOfUnreadMessage, markAsViewed, allMessages } = require('../models/message');
const validate= require('../models/message').validate;
const {User} = require('../models/user');
const mongoose = require('mongoose');

// const io;
var socket;
var MessageSocket = function (io, socket) {
    this.io = io;
    socket = socket;

    // Expose handler methods for events
    this.handler = {
        message: message.bind(this), // use the bind function to access this.io   // and this.socket in events
        viewed: viewed.bind(this),
        'get unread count': getUnreadCount.bind(this),
    };
}

async function message(io,id,message) {
    
    // create a message
    const newMessage = await createMessage(message);
    console.log(id);
    console.log("creating");

   
    // io.to(id).emit('new message',newMessage);
    // io.to(newMessage.user).emit('new message',newMessage);

    const count = await numOfUnreadMessage(newMessage.user,newMessage.sender);
    const messages = await allMessages(newMessage.user);
    
    // io.to(id).emit('unread message count', count);
    // io.to(id).emit('all Messages', messages);

    // io.to(newMessage.user).emit('unread message count', count);
    // io.to(newMessage.user).emit('all Messages', messages);
    const user = await User.findOne({isAdmin: true});
    io.to(newMessage.user).emit('all Messages', messages);
    io.to(user._id.toString()).emit('all Messages', messages);
    
    if(newMessage.sender == "admin"){
        io.to(newMessage.user).emit('new message',newMessage);
        io.to(newMessage.user).emit('unread message count', count);
       // io.to(newMessage.user).emit('all Messages', messages);
    }else{
        //const user = await User.findOne({isAdmin: true});
        io.to(user._id.toString()).emit('new message',newMessage);
        io.to(user._id.toString()).emit('unread message count', count);
       // io.to(user._id.toString()).emit('all Messages', messages);
        
    }
    

    return message;

};

async function viewed(io,id,messId) {

    if (!mongoose.Types.ObjectId.isValid(messId)) {
        return  io.to(id).emit('error','A message with this id is not found.');
    }

    const message = await markAsViewed(messId);

	if(!message) return  io.to(id).emit('error','A notification with this id is not found.');
	
    io.to(id).emit('viewed message', message);

    
    const count = await numOfUnreadMessage(message.user, message.sender);
    const messages = await allMessages(message.user);
    
    io.to(id).emit('unread message count', count);
    io.to(id).emit('all Messages', messages);

	return message;
}

async function getUnreadCount(io, socket) {
    
    const count = await numOfUnreadMessage(socket.uid,socket.user);
	const messages = await allMessages(socket.uid);
	console.log(socket.id);
    io.to(socket.id).emit('unread message count', count);
	io.to(socket.id).emit('all Messages', messages);
}



module.exports = {
    MessageSocket: MessageSocket,
    message: message,
    viewedMessage: viewed,
    getUnreadCountMessage : getUnreadCount
}