var express = require('express');
var router = express.Router();

var mysql      = require('mysql');
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'peacemaker',
	password : 's9MxufFcuShxDaB3',
	database : 'peacemaker'
});

var validator = require('validator');

var crypto = require('crypto');
var PBKDF2 = require('crypto-js/pbkdf2');
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
	if (!req.session.username) {
		res.redirect('/user/login');
	} else {
		res.redirect('/dashboard')
	}
});

router.post('/is_exist', parseForm, csrfProtection, function(req, res, next) {
	connection.query('select * from users where username = ?', req.body.username, function(err, result) {
		if (err) throw err;
		res.json({'exist': (result.length != 0)});
	});
});

router.get('/login', csrfProtection, function(req, res, next) {
	if (req.session.username) {
		res.redirect('/dashboard');
		return;
	}
	res.render('user_login', {
		csrfToken: req.csrfToken(),
		title: '로그인',
		js_b: [
			'user_login.js'
		]
	});
});

router.post('/login', parseForm, csrfProtection, function(req, res, next) {
	connection.query('select * from users where username = ?', req.body.username, function(err, result) {
		if (err) throw err;
		if (result[0].password == PBKDF2(req.body.password, result[0].salt, { keySize: 512/32, iterations: 200 }).toString()) {
			req.session.username = req.body.username;
			req.session.name = result[0].name;
			req.session.pid = result[0].pid;
			res.json({'status': 'success'});
		} else {
			res.json({'status': 'fail', 'err': 'invalid_value'});
		};
	});
});

router.get('/logout', function(req, res, next) {
	req.session.destroy(function(err) {
		res.redirect('/user');
	});
});

router.get('/register', csrfProtection, function(req, res, next) {
	if (req.session.username) {
		res.redirect('/dashboard');
	} else {
		res.render('user_register', {
			csrfToken: req.csrfToken(),
			title: '회원가입',
			js_b: [
				'user_register.js'
			],
			extjs: [
				'https://www.google.com/recaptcha/api.js'
			]
		});
	};
});

router.post('/register', parseForm, csrfProtection, function(req, res, next) {
	var _salt = (SHA1(crypto.randomBytes(256)).toString()).slice(0,32);
	var user = {
		name: req.body.name,
		username: req.body.username,
		password: PBKDF2(req.body.password, _salt, { keySize: 512/32, iterations: 200 }).toString(),
		mail: req.body.mail,
		phone: req.body.phone,
		salt: _salt
	};
	if (!validator.isAlphanumeric(req.body.username) ||
			!validator.isEmail(req.body.mail) ||
			!validator.isNumeric(req.body.phone)) {
		res.json({'status': 'fail', 'err': 'invalid_value'});
		return;
	};
	verifyReCaptcha(req.body["g-recaptcha-response"], function(success) {
		if (success) {
			connection.query('select * from users where username = ?', user.username, function(err, result) {
				if (err) throw err;
				if (result.length == 0) {
					connection.query('insert into users set ?', user, function(err, result) {
						if (err) throw err;
						res.json({'status': 'success'});
					});
				} else {
					res.json({'status': 'fail', 'err': 'duplicate_username'});
				};
			});
		} else {
			res.json({'status': 'fail', 'err': 'invalid_captcha'});
			return;
		};
	});
});

router.get('/edit/profile', csrfProtection, function(req, res, next) {
	if (!req.session.username) {
		res.redirect('/user');
	} else {
		connection.query('select * from users where pid = ?', [req.session.pid], function(err, result) {
			if (err) throw err;
			console.log(result[0]);
			res.render('user_edit_profile', {
				csrfToken: req.csrfToken(),
				name: req.session.name,
				username: req.session.username,
				email: result[0].mail,
				phone: result[0].phone,
				js_b: [
					'user_edit_profile.js'
				],
				extjs: [
					'https://www.google.com/recaptcha/api.js'
				]
			});
		});
	};
});

router.post('/edit/profile', parseForm, csrfProtection, function(req, res, next) {
	if (!validator.isEmail(req.body.mail) ||
			!validator.isNumeric(req.body.phone)) {
		res.json({'status': 'fail', 'err': 'invalid_value'});
		return;
	};
	if (req.session.pid) {
		connection.query('select * from users where pid = ?', [req.session.pid], function(err, result) {
			if (err) throw err;
			if (result[0].password == PBKDF2(req.body.password, result[0].salt, { keySize: 512/32, iterations: 200 }).toString()) {
				connection.query('update users set mail = ?, phone = ? where pid = ?', [req.body.mail, req.body.phone, req.session.pid], function(err, result) {
					if (err) throw err;
					res.json({'status': 'success'});
				});
			} else {
				res.json({'status': 'fail', 'err': 'invalid_password'});
			};
		});
	} else {
		res.json({'status': 'fail', 'err': 'invalid_access'});
	};
});

router.get('/edit/pw', csrfProtection, function(req, res, next) {
	if (!req.session.username) {
		res.redirect('/user');
	} else {
		connection.query('select * from users where pid = ?', [req.session.pid], function(err, result) {
			if (err) throw err;
			res.render('user_edit_pw', {
				csrfToken: req.csrfToken(),
				name: req.session.name,
				username: req.session.username,
				user_name: result[0].name,
				js_b: [
					'user_edit_pw.js'
				],
				extjs: [
					'https://www.google.com/recaptcha/api.js'
				]
			});
		});
	};
});

router.post('/edit/pw', parseForm, csrfProtection, function(req, res, next) {
	if (req.session.pid) {
		connection.query('select * from users where pid = ?', [req.session.pid], function(err, result) {
			if (err) throw err;
			if (result[0].password == PBKDF2(req.body.password, result[0].salt, { keySize: 512/32, iterations: 200 }).toString()) {
				var newPW = PBKDF2(req.body.newpassword, result[0].salt, { keySize: 512/32, iterations: 200 }).toString();
				connection.query('update users set password = ? where pid = ?', [newPW, req.session.pid], function(err, result) {
					if (err) throw err;
					res.json({'status': 'success'});
				});
			} else {
				res.json({'status': 'fail', 'err': 'invalid_password'});
			};
		});
	} else {
		res.json({'status': 'fail', 'err': 'invalid_access'});
	};
});

module.exports = router;
