const express = require('express');
const router = express();
const upload = require('../middleware/upload2');
const {auth} = require('../middleware/auth');
const config = require('config');

router.use(express.urlencoded({extended :true})); 

router.post('/',[auth,upload.single('file')] ,(req, res) => {
    if(req.im) return res.status(400).send(req.im);
    console.log(req);
 //  res.status(201).send(`${config.get('url')}/` + req.file.path);
   res.status(201).send('http://localhost:5000/' + req.file.path);
});

module.exports = router;