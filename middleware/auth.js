const jwt = require('jsonwebtoken');
const config = require('config');

function auth(req, res, next){
	const token = req.header('x-auth-token');
	if(!token) return res.status(401).send('Access Denied. No token provided');
	
	try{
		const decoded = jwt.verify(token,config.get('jwtPrivateKey'));
		req.user = decoded;
		next();
	}catch(e){
		res.status(400).send('Invalid token');
	}
	
}

function authSocket(socket,next){
	console.log("innn");
	if(socket.handshake.query && socket.handshake.query['uid'] && socket.handshake.query['token']){
		// const uid = socket.handshake.query['uid'];
		// const user = socket.handshake.query['user'];
		// socket.uid = uid;
		// socket.user = user;
		// next();

		const token = socket.handshake.query['token'];
		jwt.verify(token,config.get('jwtPrivateKey'),function(err, decoded){
			if(err){
				console.log(err);
				return next(new Error('Authentication error'));
			}
			if(decoded.isAdmin){
				socket.user = "student";
			
			}else{
				socket.user = "admin";
			
				
			}
			socket.uid = socket.handshake.query['uid'];
			socket.id = decoded._id;
			next();
		});
		
	}
	else{
		console.log('no query in socket');
		next(new Error('Authentication error'));
	}
}

module.exports = {
	auth: auth,
	authSocket: authSocket
}