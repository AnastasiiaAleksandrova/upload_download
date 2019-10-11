const express = require('express');
const app = express();
const port = process.env.port || 3001;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

app.use(express.static(path.join(__dirname, 'client', 'build')));

const storage = multer.diskStorage({
    destination: path.join(__dirname, 'uploads'),
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
      }
});

const upload = multer({ storage: storage }).single('file');


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });

app.post('/upload', (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.log(err)
        } else if (err) {
            console.log(err);
        }
        console.log("OK")
    });
    //res.status(200);
    res.sendStatus(200);
});

app.get('/upload', (req, res) => {
    fs.readdir('./uploads', (err, files) => {
        res.send(files);
     });
});

app.get('/download/:file', (req, res) => {
    const file = path.join(__dirname, 'uploads', req.params.file);
    try {
        console.log(file)
        res.download(file, function(err) {
            if (err) {
                console.log(err)
            } else {
                console.log('OK')
            }
        });
        
    } catch(err) {
        console.log(err)
    };
    
});

app.listen(port, () => {console.log(`Server is listening on port ${port}`)});