// imports and prep

const express = require('express');
const multer = require('multer');
const { MongoClient, ServerApiVersion } = require('mongodb');
const mong = require('mongoose');
const {GridFsStorage} = require('multer-gridfs-storage');

//

const app = express();
const port = 80;
require('dotenv').config();
const client = new MongoClient((process.env.DBCONNECT+'?retryWrites=true&w=majority'), { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect();
mong.connect(process.env.DBCONNECT+"items");
var conn = mong.connection;
let gfb;
conn.once("open", function() {   
    gfb = new mong.mongo.GridFSBucket(conn.db);
})



// schema för föremål
const itemSchema = new mong.Schema({
    name: String,
    desc: String,
    price: Number,
    catagories: [String],
    imgid: String

})

// gridfs objekt
const storage = new GridFsStorage({
    db: client.db('items'),
    
    file: (req, file) => {
        return {
            filename: "file_" + Date.now(),

        };
    }
});

const upload = multer({storage});

app.get('/img/:fn', (req, res) => {
    gfb.openDownloadStreamByName(req.params.fn).pipe(res);
}) 


const Item = mong.model('Item', itemSchema);
// actual stuff.

function uploadText(text, fn) {
    var cats = text.cats.split('|');
    var mod = new Item({
        name: text.name,
        desc: text.desc,
        price: text.price,
        catagories: cats,
        imgid: fn
    })
    mod.save();
}

async function get(body) {
    var item = [];
    switch(body.type) {
        case("all"): {
            var docs = await Item.find();
            
            for(let i = 0; i < docs.length; i++) {
                item[i] = {};
                item[i].name = docs[i].name;
                item[i].desc = docs[i].desc;
                item[i].price = docs[i].price;
                item[i].cats = docs[i].catagories;
                item[i].imgid = docs[i].imgid;
            }  
            break;
        }
        case("catagory"): {
            var docs = await Item.find({catagories: body.cat});
            
                for(let i = 0; i < docs.length; i++) {
                    item[i] = {};
                    item[i].name = docs[i].name;
                    item[i].desc = docs[i].desc;
                    item[i].price = docs[i].price;
                    item[i].cats = docs[i].catagories;
                    item[i].imgid = docs[i].imgid;
                }       
            
            break;
        }
        case("single"): {
            var docs = await Item.find({name: body.name});
            
                item[0] = {};
                item[0].name = docs[0].name;
                item[0].desc = docs[0].desc;
                item[0].price = docs[0].price;
                item[0].cats = docs[0].catagories;
                item[0].imgid = docs[0].imgid;   
            
            break;
        }
    }
    return(item);
}


app.listen(port, () => {
    console.log("Listening...");
})



exports.up = upload;
exports.client = client;
exports.textUpload = uploadText;
exports.get = get;

require('./router')(app);

