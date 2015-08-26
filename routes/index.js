var express = require('express');
var router = express.Router();
var mime = require('mime');
var fs = require("fs");

var mysql = require('mysql');
var connection = mysql.createConnection({
	host     : 'localhost',
	port     : 3306,
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

router.get('/dashboard', csrfProtection, function(req, res, next) {
	if (!req.session.username) {
		res.redirect('/user/login/back');
	} else {
		connection.query('select * from project_entries join projects on projects.id = project_entries.id where pid = ?', [req.session.pid], function(err, project_result) {
			if (err) throw err;
			connection.query('select *, projects.name as `title`, notifications.id as `notification_id` from notifications join projects on projects.id = notifications.project_id join users on users.pid = notifications.subject_id where object_id = ?', [req.session.pid], function(err, notification_result) {
				if (err) throw err;
				console.log(notification_result);
				res.render('dashboard', {
					user: {
						name: req.session.name,
						username: req.session.username,
						pid: req.session.pid
					},
					title: '대시보드',
					csrfToken: req.csrfToken(),
					projects:project_result,
					notifications:notification_result
				});
			});
		});
	}
});

var fields = [
	{name : 'uploadFile', maxCount:1},
	{name : 'uploadImage', maxCount:1}
];

router.post('/files', upload.fields(fields), function(req, res) {
	//console.log("1:"+req.files['uploadFile']);
	//console.log("2:"+req.files['uploadImage']);
	var file;
	var ib;
	if(req.files['uploadFile']) {
		ib = 1;
		file = {
			path: req.files['uploadFile'][0].filename,
			original: req.files['uploadFile'][0].originalname,
			size: req.files['uploadFile'][0].size,
			allow_project: -1
		};
	} else {
		ib = 2;
		file = {
			path: req.files['uploadImage'][0].filename,
			original: req.files['uploadImage'][0].originalname,
			size: req.files['uploadImage'][0].size,
			allow_project: -1
		};
	}
	connection.query('insert into files set ?', file, function(err, result) {
		if (err) throw err;
		if(ib == 1) {
			console.log(req.files['uploadFile']);
			res.json(req.files['uploadFile']);
		}
		else {
			console.log(req.files['uploadImage']);
			res.json(req.files['uploadImage']);
		}
	});
});

router.get('/files/:id', function(req, res) {
	var filename = req.params.id;
	connection.query('select original from files where path = ?', [filename], function(err, result) {
		if (err) throw err;
		if(result.length) {
			var filepath = __dirname + '/../public/uploads/' + filename;
			res.download(filepath, result[0].original);
		} else {
			res.status(404);
			res.render('error', {
				message: 'Not Found',
				error: {}
			});
		}
	});
});

router.get('/about', function(req, res) {
	res.render('about');
});

router.get('/image', function(req, res) {
	if(!req.query.v) {
		res.status(404);
		res.render('404error');
	}  else {
		fs.readFile( __dirname + '/../public/uploads/' + req.query.v, function(err, resImg) {
			if(err) {
				res.status(404);
				res.render('404error');
			} else {
				var imgType;
				connection.query('select original from files where path = ?', [req.query.v], function(err, result) {
					imgType = mime.lookup(result[0].original);
					res.writeHead(200, {'Content-Type' : imgType});
					res.end(resImg);
				});
			}
		});
	}

});

module.exports = router;
