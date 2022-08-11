const winston = require('winston');
const nodeCron = require("node-cron");
const mongoose = require("mongoose");
const {Application} = require('../models/application');
const {Notification} = require('../models/notification');
const {newNotification} = require('../startup/connection');

async function birthdayScheduler(){

	let studs = await Application.find({isDeleted:false});

	studs.forEach(async(stud) => {
		var date1 = new Date(stud.birthDate).setHours(0,0,0,0);
		var date2 = new Date().setHours(0,0,0,0);
		
		if(date1.valueOf() === date2.valueOf()){
			const newNot = new Notification({
				title:"Happy Birthday!",
				content: `Happy Birthday ${stud.firstName} ${stud.lastName}. We wish you all the best!'`,
				user: stud._id
				
			});
			await newNotification(newNot);
		}
	
		
		   
	});
  


}

async function embassyScheduler(){
	let studs = await Application.find({isDeleted:false});

	studs.forEach(async(stud) => {
		var date2 = new Date().setHours(0,0,0,0);
		
		if(stud.aptDate){
			var date1 = new Date(stud.aptDate).setHours(0,0,0,0);
			if(date1.valueOf() === date2.valueOf()){
				const newNot = new Notification({
					title:"Embassy Appointnment!",
					content: `Happy Birthday ${stud.firstName} ${stud.lastName}. We wish you all the best!'`,
					user: stud._id
					
				});
				await newNotification(newNot);
			}
		}
	
	
		
		   
	});
}

module.exports.birthdayScheduler = birthdayScheduler;
module.exports.embassyScheduler = embassyScheduler;