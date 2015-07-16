var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/peacemaker';

var validator = require('validator');

var crypto = require('crypto');
var SHA512 = require('crypto-js/sha512');
var SHA1 = require('crypto-js/sha1');

var csrf = require('csurf');
var csrfProtection = csrf({cookie: true});
var bodyParser = require('body-parser');
var parseForm = bodyParser.urlencoded({extended: false});

router.get('/:project', function(req, res, next) {
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var projects = db.collection('projects');
		projects.findOne({url:req.params.project}, function(err, doc) {
			if (err) throw err;
			res.json(doc);
		});
	});
});

module.exports = router;
