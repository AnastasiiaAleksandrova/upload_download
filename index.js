const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

app.use(express.static(path.join(__dirname, 'client', 'build')));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const FILE_DIR = './uploads';

const fileStorage = multer.diskStorage({
    destination: path.join(__dirname, FILE_DIR),
    filename: function (req, file, cb) {
        let item = { id: req.params.id, name: file.originalname, tstamp: new Date().getTime()};
        storage.set(item.id, item);
        cb(null, `${buildFileName(item.tstamp, req.params.id, file.originalname)}`);
      }
});

const fileUpload = multer({ storage: fileStorage }).single('file');

let storage = new Map();
{ 
    fs.readdir(FILE_DIR, (err, files) => {
        files.map(name => 
            ({ id: name.substring(13, 49), tstamp: name.substring(0, 13), name: name.substring(49) }) 
        ).forEach(item => {
            filepool.set(item.id, item);
        });
    });
}


app.get('/files', (req, res) => {
    res.send(Array.from(storage.values()));
    //res.sendStatus(500);  // ERROR TESTING
});

app.post('/file/:id', (req, res) => {
    let id = req.params.id;
    if (!storage.has(id)) { 
    //if (!filepool.has(id) && false) {  // ERROR TESTING
        fileUpload(req, res, err => {
            if (!err) {
                res.sendStatus(200);
            } else {
                res.sendStatus(500);
            } 
        })
    } else { 
        res.sendStatus(400); 
    }
});

app.delete('/file/:id', (req, res) => {
    let item = storage.get(req.params.id);
    if (typeof item !== 'undefined') {   
    //if (typeof item !== 'undefined' && false) {  // ERROR TESTING
        const file = path.join(__dirname, FILE_DIR, 
            buildFileName(item.tstamp, item.id, item.name));
        fs.unlinkSync(file);
        
        storage.delete(item.id);
        
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

app.get('/file/:id', (req, res) => {
    let item = storage.get(req.params.id);
    if (typeof item !== 'undefined') {
        let fileName = buildFileName(item.tstamp, item.id, item.name)
        console.log(item.name);
        res.download(path.join(__dirname, FILE_DIR, fileName), item.name, err => { 
            if (err) {
                console.log(err)
            } 
        });
    } else {
        res.sendStatus(404);
    }
});

function buildFileName(tstamp, id, name) {
    return `${tstamp}${id}${name}`;
}


app.listen(port, () => {console.log(`Server is listening on port ${port}`)});