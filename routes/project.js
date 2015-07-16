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

router.post('/is_exist', parseForm, csrfProtection, function(req, res, next) {
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var projects = db.collection('projects');
		projects.findOne({url:req.body.addr}, function(err, doc) {
			if (err) throw err;
			res.json({'exist': (doc != null)});
		});
	});
});

router.get('/new', csrfProtection, function(req, res, next) {
	if (!req.session.username) {
		res.redirect('/user/login');
		return;
	}
	res.render('project_new', {
		csrfToken: req.csrfToken(),
		title: '새 프로젝트',
		js_b: [
			'project_new.js'
		],
		extjs: [
			'https://www.google.com/recaptcha/api.js'
		]
	});
});

router.post('/new', parseForm, csrfProtection, function(req, res, next) {
	if (!req.session.username) {
		res.json({'status': 'fail', 'err': 'session_expired'});
		return;
	}
	var project = {
		name: req.body.name,
		url: req.body.addr,
		desc: req.body.desc,
		admin: new ObjectID(req.session._id),
		users: [new ObjectID(req.session._id)]
	};
	if (!validator.isAlphanumeric(req.body.addr)) {
		res.json({'status': 'fail', 'err': 'invalid_value'});
		return;
	};
	verifyReCaptcha(req.body["g-recaptcha-response"], function(success) {
		if (success) {
			MongoClient.connect(url, function(err, db) {
				if (err) throw err;
				var projects = db.collection('projects');
				projects.findOne({url:req.body.addr}, function(err, doc) {
					if (err) throw err;
					if (!doc) {
						projects.insert(project, function(err, doc) {
							if (err) throw err;
							res.json({'status': 'success'});
							return;
						});
					} else {
						res.json({'status': 'fail', 'err': 'duplicate_url'});
						return;
					}
				});
			});
		} else {
			res.json({'status': 'fail', 'err': 'invalid_captcha'});
			return;
		}
	});
});

module.exports = router;
