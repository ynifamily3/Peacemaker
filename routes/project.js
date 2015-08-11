var express = require('express');
var router = express.Router();

var mysql      = require('mysql');
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'peacemaker',
	password : 's9MxufFcuShxDaB3',
	database : 'peacemaker'
});

var moment = require('moment');
moment.locale('ko');

var validator = require('validator');

var crypto = require('crypto');
var SHA512 = require('crypto-js/sha512');
var SHA1 = require('crypto-js/sha1');

var csrf = require('csurf');
var csrfProtection = csrf({cookie: true});
var bodyParser = require('body-parser');
var parseForm = bodyParser.urlencoded({extended: false});

router.get('/:project', function(req, res, next) {
	if (!req.session.name) {
		res.redirect('/user/login');
	} else {
		connection.query('select * from projects where url = ?', [req.params.project], function(err, result) {
			if (err) throw err;
			var _project = result[0];
			connection.query('select * from project_entries where pid = ? and id = ?', [req.session.pid, _project.id], function(err, result) {
				if (result.length == 0) {
					res.redirect('/p/' + req.params.project + '/join');
				} else {
					res.render('project_index', {
						user: {
							name: req.session.name,
							username: req.session.username,
							pid: req.session.pid
						},
						project: {
							id: _project.id,
							url: _project.url,
							name: _project.name,
							desc: _project.desc,
							admin_id: _project.admin_id
						},
						title: _project.name
					});
				};
				if (err) throw err;
			});
		});
	};
});

router.get('/:project/join', function(req, res, next) {
	if (!req.session.name) {
		res.redirect('/user/login');
	} else {
		connection.query('select * from projects where url = ?', [req.params.project], function(err, result) {
			if (err) throw err;
			res.render('project_join', {
				user: {
					name: req.session.name,
					username: req.session.username,
					pid: req.session.pid
				},
				project: {
					id: result[0].id,
					url: result[0].url,
					name: result[0].name,
					desc: result[0].desc,
					admin_id: result[0].admin_id,
					created_date: moment(result[0].created_date).format('LL')
				},
				title: result[0].name
			});
		});
	};
});

module.exports = router;
