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
	connection.query('select * from projects where url = ?', req.body.addr, function(err, result) {
		if (err) throw err;
		res.json({'exist': (result.length != 0)});
	});
});

router.get('/new', csrfProtection, function(req, res, next) {
	if (!req.session.username) {
		res.redirect('/user/login');
		return;
	}
	res.render('project_new', {
		user: {
			name: req.session.name,
			username: req.session.username,
			pid: req.session.pid
		},
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
		admin_id: req.session.pid
	};
	if (!validator.isAlphanumeric(req.body.addr)) {
		res.json({'status': 'fail', 'err': 'invalid_value'});
		return;
	};
	verifyReCaptcha(req.body["g-recaptcha-response"], function(success) {
		if (success) {
			connection.query('select * from projects where url = ?', [req.body.url], function(err, result) {
				if (err) throw err;
				if (result.length == 0) {
					connection.query('insert into projects set ?', project, function(err, result) {
						if (err) throw err;
						var entry = {
							pid:req.session.pid,
							id:result.insertId
						};
						connection.query('insert into project_entries set ?', entry, function(err, result) {
							if (err) throw err;		
							res.json({'status': 'success'});
						});
					});
				} else {
					res.json({'status': 'fail', 'err': 'duplicate_url'});
				};
			});
		} else {
			res.json({'status': 'fail', 'err': 'invalid_captcha'});
			return;
		}
	});
});

module.exports = router;
