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

var https = require('https');
var SECRET = '6Lc9rQkTAAAAAMvwOmRaqzh_gL_SCw0sI20hr_dG';
function verifyReCaptcha(key, cb) {
	https.get("https://www.google.com/recaptcha/api/siteverify?secret=" + SECRET + "&response=" + key, function(res) {
		var data = "";
		res.on('data', function (d) {
			data += d.toString();
		});
		res.on('end', function() {
			try {
				var parsedData = JSON.parse(data);
				cb(parsedData.success);
			} catch (e) {
				cb(false);
			}
		});
	});
}

router.get('/', function(req, res, next) {
	if (req.session.username) {
		res.redirect('/dashboard');
	} else {
		res.render('index');
	}
});

router.get('/dashboard', function(req, res, next) {
	if (!req.session.username) {
		res.redirect('/user/login');
		return;
	}
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var projects = db.collection('projects');
		projects.find({users: {$in: [new ObjectID(req.session._id)]}}).toArray(function(err, docs) {
			if (err) throw err;
			res.render('dashboard', {
				title: '대시보드',
				name:req.session.name,
				projects:docs
			});
		});
	});
});

module.exports = router;
