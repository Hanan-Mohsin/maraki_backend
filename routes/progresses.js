const _ = require('lodash');
const express = require('express');
const {Progress,validate} = require('../models/progress');
const {Application} = require('../models/application');
const {auth} = require('../middleware/auth');
const Fawn = require('fawn');
const mongoose = require('mongoose');
const {admin} = require('../middleware/admin');
//Fawn.init(mongoose);
const router = express();

// Get all progresses of all applications (for admin)
router.get('/', [auth,admin],async(req,res) => {
    const progresses = await Progress.find()
    .sort('-date');

    res.send(progresses);
});

// Get progresses by id
router.get('/:id',async(req, res) => {
	
	
	
    const progress = await Progress.findOne({_id: req.params.id,isDeleted: false})
    .select('-isDeleted')

    if (!progress) return res.status(404).send('A progress with the given ID was not found.');

    res.send(progress);
});



// Post an progress
router.post('/:aid', [auth,admin],async(req, res) => {

    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

	let stud = await Application.findById(req.params.aid);
	if(!stud) return res.status(404).send('An application with the given ID was not found');
	
    let progress = new Progress(req.body);
    const id = mongoose.Types.ObjectId(req.params.aid);
    const task = new Fawn.Task();
    try{
        task.save('progresses',progress)
        .update('applications',{_id:id},{$push: {progresses:{$each:[progress._id], $sort:-1}}})
        .run();

        res.status(201).send(progress);
              
    }catch(e){
        console.log(e.message);
        res.status(500).send('Something went wrong');
    }

     
     
});

// Update a  progress of an application
router.put('/:id', [auth,admin],async(req, res) => {
	
    // req.body.userId = req.user._id;
	// const {error} = validate(req.body);
	// if(error) return res.status(400).send(error.details[0].message); 
    let progress = await Progress.findOne({_id: req.params.id, isDeleted: false});
    progress.status = req.body.status;
    progress = await Progress.findByIdAndUpdate(req.params.id,progress,{new: true}).select('-isDeleted');

    if (!progress) return res.status(404).send('A progress with the given ID was not found.');
    
    res.send(progress);
});

// Delete an progress
router.delete('/:id',auth,async(req, res) => {
	
    const progress = await Progress.findOne({_id: req.params.id, isDeleted: false});
    
    if(!progress) return res.status(404).send('A progress with the given ID was not found.');

  //  res.send('Progress is deleted');
    const task = new Fawn.Task();
    try{
		task.progress('progresses',{_id: progress._id},{isDeleted: true})
		.update('applications',{progresses:progress._id},{$pull:{'progresses': progress._id}})
		.run();

		res.send('Progress is deleted')   
	}catch(e){
		res.status(500).send('Something went wrong');
    }
});

module.exports = router;