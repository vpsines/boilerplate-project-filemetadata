var express = require('express');
var cors = require('cors');
require('dotenv').config()
var fs = require('fs');
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

var app = express();

var mongoUri = process.env.MONGO_URI;

// connect to mongoDb
mongoose.connect(mongoUri,{useNewUrlParser:true},(err)=>{
  if(err) return console.error(err);

  console.log("Connected ....");
});

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

var fileSchema = new mongoose.Schema({
  name:String,
  type:String,
  size:Number,
  data:Buffer,
});

var FileModel = new mongoose.model('Files',fileSchema);

var storage = multer.diskStorage({destination:(req,file,cb)=>{
  cb(null,'uploads');
},
filename:(req,file,cb)=>{
  cb(null,file.fieldname+'-'+Date.now());
}});

var upload = multer({storage: storage});

app.post('/api/fileanalyse',upload.single('upfile'),(req,res)=>{
  var file = fs.readFileSync(req.file.path);
  var encodeFile = file.toString('base64');
  var finalFile = {
    name:req.file.originalname,
    type:req.file.mimetype,
    data: new Buffer(encodeFile,'base64'),
    size:req.file.size
  };

  FileModel.create(finalFile,(err,result)=>{
    if(err){
      console.error(err);
      res.json(err);
    };

    console.log('File uploaded');

    var result = {
      name: req.file.originalname,
      type:req.file.mimetype,
      size:req.file.size
    };

    res.send(result);
  });
});

const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
