const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        console.log(req)
        cb(null, './uploads')
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
    }
});
//replace(/:/g, '-') 
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png'){
        cb(null, true);
    }else{
         cb(null, false);
        req.im= "Invalid image format";
    }
}

module.exports = multer({storage: storage, fileFilter: fileFilter});