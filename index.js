const winston = require('winston');
const nodeCron = require("node-cron");
const express = require('express');
const app = express();
const cors = require('cors');
const {Server} = require('socket.io');
const http = require('http');
let server = http.createServer(app);
const io = require('socket.io')(server,{cors: {origin: '*',}});
module.exports.io = io;
app.use(cors({origin: '*'}));

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);
require('./startup/connection').conn(); 

const {birthdayScheduler,embassyScheduler} = require('./startup/scheduler');
// 55 23
const job = nodeCron.schedule("30 16 * * *",birthdayScheduler);
nodeCron.schedule("30 16 * * *",embassyScheduler);

const port = 5000;
const serv = server.listen(port, () => winston.info(`Listening on port ${port}...`));

module.exports.server = serv;
