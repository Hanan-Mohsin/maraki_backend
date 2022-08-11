const _ = require('lodash');
const express = require('express');
const {Application,validate} = require('../models/application');
const bcrypt = require('bcrypt');
const {auth} = require('../middleware/auth');
const {admin,agent} = require('../middleware/admin');
const router = express();



// Get all applications of students
router.get('/', [auth,admin],async(req, res) => {
    const apps = await Application.find().sort('firstName').select('-password')
	.populate('branch','name')
	.populate('progresses','content status date');;
    res.send(apps);
});

// Get all applications by branch
router.get('/branch/:bran', [auth,agent],async(req, res) => {
    const apps = await Application.find({branch:req.params.bran,isDeleted:false}).sort('firstName').select('-password')
	.populate('branch','name')
	.populate('progresses','content status date');;
    res.send(apps);
});

// Get application of the student
router.get('/me', auth, async(req, res) => {
	const app = await Application.findOne({_id: req.app._id, isDeleted: false}).select('-password -isDeleted')
	.populate('branch','name')
	.populate('progresses','content status date');;

    if (!app) return res.status(404).send('An application with the given ID was not found.');
	res.send(app);
});

// Get application by id
router.get('/:id', [auth,agent], async(req, res) => {
	const app = await Application.findOne({_id: req.params._id, isDeleted: false}).select('-password -isDeleted')
	.populate('branch','name')
	.populate('progresses','content status date');

    if (!app) return res.status(404).send('An application with the given ID was not found.');
	res.send(app);
});

// Post an application
router.post('/',  [auth,agent],async (req,res) => {
	const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);
	
    let app = await Application.findOne({email:req.body.email});
	if(app) return res.status(400).send('Email address already exists');

	app = await Application.findOne({phoneNumber:req.body.phoneNumber});
	if(app) return res.status(400).send('Phone number already exists');
	
	app = new Application(req.body);
	const salt = await bcrypt.genSalt(10);
	app.password = await bcrypt.hash(app.password,salt);
	
	await app.save();
	const token = app.generateAuthToken();
	res.header('access-control-expose-headers','x-auth-token');
	res.header('x-auth-token',token).status(201).send(_.pick(app,['_id','firstName','lastName','email']));
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

// Update an application
router.put('/:id',[auth,agent],async(req,res) => {
	
	
	let app = await Application.findById(req.params.id);
	if(!app) return res.status(404).send('The application with the given ID was not found.');
	
	req.body.password = app.password;
	
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

     app = await Application.findByIdAndUpdate(req.params.id,req.body,{new: true});

    if (!app) return res.status(404).send('Application with the given ID was not found.');

    res.send(app);
});

// update appointment date
router.put('/embassy/:id',[auth,agent],async(req,res) => {
	
	
	let app = await Application.findById(req.params.id);
	if(!app) return res.status(404).send('The application with the given ID was not found.');
	

	app.aptDate = req.body.appointment;

     app = await Application.findByIdAndUpdate(req.params.id,app,{new: true});

    if (!app) return res.status(404).send('The application with the given ID was not found.');

    res.send(app);
});


// Delete an application
router.delete('/:id', [auth,admin], async(req, res) => {
    const  app = await Application.findByIdAndUpdate(req.params._id,{isDeleted: true},{new: true});

    if (!app) return res.status(404).send('The application with the given ID was not found.');

    res.send('Application is deleted');



    
});

module.exports = router;