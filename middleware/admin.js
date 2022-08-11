
function admin(req, res, next){
	if(!req.user.isAdmin) return res.status(403).send('Access Denied');
	next();
	
}

function agent(req, res, next){
	if(!req.user.isAgent) return res.status(403).send('Access Denied');
	next();
	
}

module.exports = {
	admin: admin,
	agent: agent
}