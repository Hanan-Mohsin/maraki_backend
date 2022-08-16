const _ = require('lodash');
const express = require('express');
const {Branch,validate} = require('../models/branch');
const {auth} = require('../middleware/auth');
const {admin} = require('../middleware/admin');

const router = express();

// Get all branches
router.get('/', async(req,res) => {
    const branches = await Branch.find().sort('name');
    res.send(branches);
});

router.get('/:id', async(req,res) => {
	
	
    const branch = await Branch.findOne({_id:req.params.id});
	if(!branch) return res.status(404).send('Branch with the given ID was not found.');
    res.send(branch);
});

// Post a branch
router.post('/',auth,async(req,res) => {
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

    let branch = new Branch(_.pick(req.body,['name']));
    branch = await branch.save();

    res.send(branch);
});

// Update a branch
// router.put('/:id',[auth,admin],async(req,res) => {
//     const {error} = validate(req.body);
// 	if(error) return res.status(400).send(error.details[0].message);

//     const branch = await Branch.findByIdAndUpdate(req.params.id,req.body,{new: true});

//     if (!branch) return res.status(404).send('The branch with the given ID was not found.');

//     res.send(branch);
// });

router.delete('/:id', async(req,res) => {
	 
    const branch = await Branch.findByIdAndRemove(req.params.id);
	if(!branch) return res.status(404).send('Branch with the given ID was not found.');
    res.send('Branch is deleted!');
});

module.exports = router;