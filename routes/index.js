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

var multer = require('multer');
var upload = multer({dest: __dirname + '/../public/uploads/'});

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
				user: {
					name: req.session.name,
					username: req.session.username,
					pid: req.session.pid
				},
				title: '대시보드',
				projects:result
			});
		});
	};
});

router.post('/files', upload.single('uploadFile'), function(req, res) {
	res.writeHead(200);
	console.log(req.file);
	res.end(JSON.stringify(req.file));
});

router.get('/files/:id', function(req, res) {
	var filename = req.params.id;
	var realname = req.query.realname;
	filepath = __dirname + '/../public/uploads/' + filename;
	console.log(filepath);
	res.download(filepath, realname);
});

module.exports = router;
