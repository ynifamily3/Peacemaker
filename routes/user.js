var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/peacemaker';

var crypto = require('crypto');
var SHA512 = require('crypto-js/sha512');
var SHA1 = require('crypto-js/sha1');

var Recaptcha = require('recaptcha').Recaptcha;
var PUBLIC_KEY = '6Lc9rQkTAAAAANMmcu73j0W8Jo-LffN4CH0Fi8Wq';
var PRIVATE_KEY = '6Lc9rQkTAAAAAMvwOmRaqzh_gL_SCw0sI20hr_dG';

router.get('/', function(req, res, next) {
	if (!req.session.username) {
		res.redirect('/user/login');
	} else {
		res.redirect('/user/hello')
	}
});

router.get('/login', function(req, res, next) {
	res.render('user_login');
});

router.post('/login', function(req, res, next) {
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var users = db.collection('users');
		users.findOne({username:req.body.username}, function(err, doc) {
			if (err) throw err;
			if (doc != null && doc.password == SHA512(req.body.password + doc.salt).toString()) {
				req.session.username = req.body.username;
			};
			res.redirect('/user');
		});
	});
});

router.get('/logout', function(req, res, next) {
	req.session.destroy(function(err) {
		res.redirect('/user');
	});
});

router.get('/hello', function(req, res, next) {
	res.render('user_hello', {name:req.session.username});
});

router.get('/register', function(req, res, next) {
	res.render('user_register');
});

router.post('/register', function(req, res, next) {
	var _salt = (SHA1(crypto.randomBytes(256)).toString()).slice(0,32);
	var user = {
		name: req.body.name,
		username: req.body.username,
		password: SHA512(req.body.password + _salt).toString(),
		mail: req.body.mail,
		phone: req.body.phone,
		salt: _salt
	};
	var data = {
				remoteip:  req.connection.remoteAddress,
				challenge: req.body.recaptcha_challenge_field,
				response:  req.body.recaptcha_response_field
		};
	var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY, data);
	recaptcha.verify(function(success, error_code) {
		if (success) {
			MongoClient.connect(url, function(err, db) {
				if (err) throw err;
				var users = db.collection('users');
				users.findOne({username:req.body.username}, function(err, doc) {
					if (err) throw err;
					if (doc == null) {
						users.insert(user, function(err, doc) {
							if (err) throw err;
							res.redirect('/user/login');
						})
					} else {
						res.redirect('/user/register');
					}
				});
			});
		}
		else {
			res.redirect('/user/register')
		}
	});
});

module.exports = router;
