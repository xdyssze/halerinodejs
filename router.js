const upload = require('./app').up;
const client = require('./app').client;
const textUpload = require('./app').textUpload;

const getJSON = require('./app').get;
const getImg = require('./app').getImg;
var grd = require('./app').grd;

module.exports = function(app) {

    app.get('/', (req, res) => {
        res.writeHead(404, {'Content-Type': 'text/html'});
    })

    app.get('/get', (req, res) => {
        let b = {};
        let jsonString;
        if(req.query.catagory && req.query.catagory.length > 0) {
            b.type = "catagories";
            b.cat = req.query.catagory;
        } else if(req.query.name && req.query.name.length > 0) {
            b.type = "single";
            b.name = req.query.name;
        } else {
            b.type = "all";
        }
        
        (async () => {
            res.json(await getJSON(b));
        })()
        return;
    })
    

    app.get('/itemupload', (req, res) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<h1>Sex med antilop uppladdning</h1>');
        res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
        res.write('<label for="name">Name:<br></label>');
        res.write('<input type="text" name="name" required><br>');
        res.write('<label for="price">Price:<br></label>');
        res.write('<input type="text" name="price" required><br>');
        res.write('<label for="price">Catagories Separated by space:<br></label>');
        res.write('<input type="text" name="cats" required><br>');
        res.write('<label for="desc">Desc:<br></label>');
        res.write('<input type="text" name="desc" required><br>');
        res.write('<label for="itemimg">Item Img:<br></label>');
        res.write('<input type="file" name="itemimg" required><br>');
        res.write('<input type="submit">');
        res.write('</form>');
        res.end();
    }) 
    app.post('/fileupload', upload.single('itemimg'), (req, res, next) => {
        textUpload(req.body, req.file.filename);
        console.log(req.file.filename);
        
        res.redirect('/itemupload');
    

    })

    
    app.get('/close', () => {
        client.close();
       exit();
    })
}