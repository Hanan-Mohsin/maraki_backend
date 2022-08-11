const winston = require('winston');
const {io} = require('../index');
const {authSocket} = require('../middleware/auth');
const {NotificationSocket, notification, viewed,getUnreadCount} = require('../realtime/notificationSocket');
const {MessageSocket, message, viewedMessage,getUnreadCountMessage} = require('../realtime/messageSocket');

var sock;

function conn(){
    io
    .use(authSocket)
    .on('connection', async(socket) => {
        sock = socket;
     
       winston.info('Connected from server!');
        socket.join(socket.id);


      
      async function getUnread(){
        await  getUnreadCount(io, socket);
      }
      getUnread().then();

      async function getUnreadMessage(){
        await  getUnreadCountMessage(io, socket);
      }
      getUnreadMessage().then();

       
    });

  

}

async function newNotification(not){
        const noti = await notification(io,not)
        return noti;
}

async function viewedNotification(userId,notificationId){
    const noti = await viewed(io, userId, notificationId);
    sockets = [];
	return noti;
}

async function newMessage(id,mes){
  const mess = await message(io,id,mes);
  return mess;

}

async function viewedMess(id,messId){
const mess = await viewedMessage(io, id, messId);
sockets = [];
return mess;
}

module.exports = {
    conn: conn,
    newNotification: newNotification,
    viewedNotification: viewedNotification,
    newMessage: newMessage,
    viewedMess: viewedMess
}
