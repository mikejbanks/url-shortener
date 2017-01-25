/* URL shortener, working version https://mbshrtn.herokuapp.com */

var express = require('express')
var app = express()
var router = express.Router();
var mongodb = require('mongodb');
var shortid = require('shortid');
var validator = require('validator');
var config = require('./config');
var mLab = 'mongodb://' + config.db.host + '/' + config.db.name;
var MongoClient = mongodb.MongoClient



app.set('port', (process.env.PORT || 5000));

/* New URLs will be entered in /new/ directory */
app.get('/new/:url(*)', function (req, res, next) {
MongoClient.connect(mLab, function (err, db) {
  if (err) {
    console.log("Unable to connect to server", err);
  } else {
    console.log("Connected to server")
	var collection = db.collection('links');
	var params = req.params.url;
	insertDatabase=validator.isURL(params);
	var newLink = function (db, callback) {
	if(insertDatabase&&req.params.url!='favicon.ico'){
	var shortCode = shortid.generate();
	var newUrl = { url:params, short: shortCode};
	collection.insert([newUrl]);
	res.json({ original_url: params, short_url: "http://mbshrtn.herokuapp.com/" + shortCode });
	}
	else{
		res.send("URL not formatted correctly.");
	}
};
 
newLink(db, function () {
  db.close();
});
  };
});

})

/* Shortcodes are used to redirect to previously saved URLs */
app.get('/:shortcodeMngdb', function (req, res, next) {
MongoClient.connect(mLab, function (err, db) {
  if (err) {
    console.log("Unable to connect to server", err);
  } else {
    console.log("Connected to server")
	var collection = db.collection('links');
	var params = req.params.shortcodeMngdb;
	var newLink = function (db, callback) {
	collection.findOne({ "short": params }, { url: 1, _id: 0 }, function (err, doc) {
  if (doc != null) {
    res.redirect(doc.url);
  } else {
    res.json({ error: "No corresponding shortlink found in the database." });
  };
});
};
 
newLink(db, function () {
  db.close();
});
  };
});

})





app.listen(app.get('port'), function () {
  console.log('App listening on port 5000!')
})