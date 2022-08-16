const _ = require('lodash');
const express = require('express');
const {User,validate} = require('../models/user');
const bcrypt = require('bcrypt');
const {auth} = require('../middleware/auth');
const {admin,agent} = require('../middleware/admin');
const router = express();


// Get all users
router.get('/', [auth,admin],async(req, res) => {
    const users = await User.find().sort('firstName').select('-password').populate('branch','name');
    res.send(users);
});

// Get one user
router.get('/me', auth, async(req, res) => {
	const user = await User.findOne({_id: req.user._id, isDeleted: false}).select('-password -isDeleted').populate('branch','name');

    if (!user) return res.status(404).send('The user with the given ID was not found.');
	res.send(user);
});

// Register a user
router.post('/',async (req,res) => {
	const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);
	
    	let user = await User.findOne({email:req.body.email});
	if(user) return res.status(400).send('Email address already exists');

	user = await User.findOne({phoneNumber:req.body.phoneNumber});
	if(user) return res.status(400).send('Phone number already exists');
	
	user = new User(req.body);
	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password,salt);
	
	await user.save();
	const token = user.generateAuthToken();
	res.header('access-control-expose-headers','x-auth-token');
	res.header('x-auth-token',token).status(201).send(_.pick(user,['_id','firstName','lastName','email']));
});

// Register an agent
router.post('/agent',async (req,res) => {
	const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);
	
    	let user = await User.findOne({email:req.body.email});
	if(user) return res.status(400).send('Email address already exists');

	user = await User.findOne({phoneNumber:req.body.phoneNumber});
	if(user) return res.status(400).send('Phone number already exists');
	
	user = new User(req.body);
	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password,salt);
	user.isAgent = true;
	await user.save();
	const token = user.generateAuthToken();
	res.header('access-control-expose-headers','x-auth-token');
	res.header('x-auth-token',token).status(201).send(_.pick(user,['_id','firstName','lastName','email']));
});

// Update a user
router.put('/me', auth, async(req, res) => {

    let user = await User.findById(req.user._id);
	if(!user) return res.status(404).send('The user with the given ID was not found.');
	console.log(req.body);
	if(req.body.password){

		const {error} = validate(req.body);
		if(error) return res.status(400).send(error.details[0].message);
		
		const salt = await bcrypt.genSalt(10);
		req.body.password = await bcrypt.hash(req.body.password,salt);

	}else{
		req.body.password = user.password;
		const {error} = validate(req.body);
		if(error) return res.status(400).send(error.details[0].message);
	}
	
	user = await User.findOne({email: req.body.email});
	if(user){
		if(user._id.toString() !== req.user._id.toString())return res.status(400).send('User with this email address already exists!');
	}
	
    user = await User.findByIdAndUpdate(req.user._id,req.body,{new: true}).select('-password -isDeleted');

    if (!user) return res.status(404).send('The user with the given ID was not found.');
    res.send(user);
});


// router.post('/forget', async(req,res) => {
// 	if(!req.body.email) return res.status(400).send('An empty body is not allowed');
// 	const email = req.body.email;
// 	let user = await User.findOne({email:req.body.email});
// 	if(!user) return res.status(404).send('A user with this email address is not found!');
// 	const link = `${config.get('link')}/verify/${user._id}`;
	
// 	const transporter = nodemailer.createTransport({
// 		service: 'gmail',
// 		auth: {
// 			user: config.get('email'),
// 			pass: config.get('password')
// 		}
// 	});
	
// 	const mailOption = {
// 		from: config.get('email'),
// 		to:email,
// 		subject:'Reset password',
// 		html: "Hello,<br> Please click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
// 	};
	
// 	transporter.sendMail(mailOption, function(error, info){
// 		if(error){
// 			winston.error(error.message,error);
// 			//throw error;
// 			res.status(500).send('Something went wrong');
// 		}else{
// 			console.log('Email sent: '+ info.response);
// 			res.status(200).send('sent');
// 		}
// 	});
	
	
// });

// router.get('/verify/:id', async(req,res) => {


// 	let user = await User.findById(req.params.id);
	
// 	if(!user) return res.status(404).send('A user with this email address is not found!');
	
// 	res.send({id: req.params.id});
	
	
// });

// router.put('/reset/:id', async(req,res) => {
	
	
// 	const salt = await bcrypt.genSalt(10);
// 	if(!req.body.password) return res.status(400).send('An empty body is not allowed');
// 	req.body.password = await bcrypt.hash(req.body.password,salt);
	
// 	const user = await User.findByIdAndUpdate(req.params.id, {password: req.body.password},{new: true});
// 	if(!user) return res.status(404).send('A user with this id is not found!');
	
// 	res.send(user);
	
// });

router.put('/:id',[auth,admin],async(req,res) => {
	
	
	 let user = await User.findById(req.params.id);
	if(!user) return res.status(404).send('The user with the given ID was not found.');
	
	req.body.password = user.password;
	
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

     user = await User.findByIdAndUpdate(req.params.id,req.body,{new: true});

    if (!user) return res.status(404).send('User with the given ID was not found.');

    res.send(user);
});

// Delete user
router.delete('/me', auth, async(req, res) => {
    const  user = await User.findByIdAndUpdate(req.user._id,{isDeleted: true},{new: true});

    if (!user) return res.status(404).send('The user with the given ID was not found.');

    res.send('User is deleted');



    
});

module.exports = router;