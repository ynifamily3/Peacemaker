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
	} else {
		connection.query('select * from project_entries join projects on projects.id = project_entries.id where pid = ?', [req.session.pid], function(err, result) {
			if (err) throw err;
			res.render('dashboard', {
				title: '대시보드',
				name:req.session.name,
				projects:result
			});
		});
	};
});

module.exports = router;
