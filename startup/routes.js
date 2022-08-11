const express = require('express');
const users = require('../routes/users');
const applications = require('../routes/applications');
const messages = require('../routes/messages');
const notifications= require('../routes/notifications');
const branches= require('../routes/branches');
const progress= require('../routes/progresses');
const auth = require('../routes/auth');
const image = require('../routes/image');
const file = require('../routes/file');
const error = require('../middleware/error');

module.exports = function(app){
	app.use(express.json());
	app.use('/api/users', users);
	app.use('/api/applications', applications);
	app.use('/api/messages', messages);
	app.use('/api/notifications', notifications);
	app.use('/api/branches', branches);
	app.use('/api/progress', progress);
	app.use('/api/image', image);
	app.use('/api/file', file);
    app.use('/api/auth', auth);
	app.use(error);
}