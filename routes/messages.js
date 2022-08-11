const _ = require('lodash');
const express = require('express');
const {Message,validate} = require('../models/message');
const {auth} = require('../middleware/auth');
const {admin} = require('../middleware/admin');
const router = express();
const {viewedMess,newMessage} = require('../startup/connection');


// Get all messages
router.get('/', [auth,admin],async(req, res) => {
    const messages = await Message.find({isDeleted:false})
                            .sort('date')
                            .populate('user','firstName lastName email');
    res.send(messages);
});

// Get message by user
router.get('/user/:uid', [auth,admin],async(req, res) => {

    const messages = await Message
                        .find({user:req.params.uid,isDeleted:false})
                        .sort('date')
                        .populate('user','firstName lastName email');
                        
    res.send(messages);
});


router.get('/:id', [auth,admin],async(req, res) => {

    const message = await Message
                        .findOne({_id:req.params.id,isDeleted:false})
                        .populate('user','firstName lastName email');
                        
    res.send(message);
});



router.post('/', auth,async(req, res) => {
	console.log(req.body);
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);
		
    let message = new Message(req.body);
    message = await newMessage(req.user._id,message);
    res.status(201).send(message);

});

router.put('/:id', auth,async(req,res) => {
    let mess = await Message.findOne({_id:req.params.id,isDeleted:false});
    
    if((req.user.isAdmin && mess.sender !== "admin") || (!req.user.isAdmin && mess.sender !== "student") ){
        mess = await viewedMess(req.user._id,req.params.id);
        console.log(mess.content);
        res.send(mess);
    }else{
        res.send("viewed");
    }
  
});

router.delete('/:id',auth,async(req, res) => {
	
    const message = await Message.findByIdAndUpdate(req.params.id,{isDeleted: true},{new: true});

    if (!message) return res.status(404).send('A message with the given ID was not found.');

    res.send('Message is deleted') 

  
});

module.exports = router;