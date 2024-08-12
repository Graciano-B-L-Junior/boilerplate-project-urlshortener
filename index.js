require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const dns = require('dns')
var bodyParser = require('body-parser')
const urlparser = require('url')


const db = new sqlite3.Database('./project_url.db',sqlite3.OPEN_READWRITE,function(err){
  
});

db.run("CREATE TABLE IF NOT EXISTS urls (id INTEGER PRIMARY KEY, url TEXT)",function(err){
  
})
// parse application/x-www-form-urlencoded

// parse application/json
app.use(express.json())

app.use(express.urlencoded({ extended: false }))
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

function validateURL(url) {
  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/;
  return urlPattern.test(url);
}

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/shorturl",function(req,res){
  let url = req.body.url

  const dnslookup = dns.lookup(urlparser.parse(url).hostname,async function(err,address){

    if(!address){
      res.json({ error: 'invalid url' })
    }else{
      db.run(`INSERT INTO urls (url) VALUES (?)`, [url], function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`A row has been inserted with rowid ${this.lastID}`);
        console.log(this)
        res.json({
          "original_url":url,
          "short_url":this.lastID
        })
    });

    }
  })
})

app.get("/api/shorturl/:short_url",async function(req,res){
  let url = ""
  await db.get("SELECT url FROM urls WHERE id = ? LIMIT 1",[req.params.short_url],function(err,row){
    url = row.url
    res.redirect(url)
  })
})

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
