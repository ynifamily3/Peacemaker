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
				if (err) throw err;
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
							admin_id: _project.admin_id,
							hangout_url: _project.hangout_url
						},
						title: _project.name
					});
				};
			});
		});
	};
});

router.get('/:project/calendar', function(req, res, next) {
	if (!req.session.name) {
		res.redirect('/user/login');
	} else {
		connection.query('select * from projects where url = ?', [req.params.project], function(err, result) {
			if (err) throw err;
			var _project = result[0];
			connection.query('select * from project_entries where pid = ? and id = ?', [req.session.pid, _project.id], function(err, result) {
				if (err) throw err;
				if (result.length == 0) {
					res.redirect('/p/' + req.params.project + '/join');
				} else {
					res.render('project_calendar', {
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
							admin_id: _project.admin_id,
							hangout_url: _project.hangout_url
						},
						title: _project.name,
						js: [
							'moment.js',
							'fullcalendar.js',
							'fullcalendar-ko.js'
						],
						css: [
							'fullcalendar.css'
						]
					});
				};
			});
		});
	};
});

router.get('/:project/hangout', csrfProtection, function(req, res, next) {
	if (!req.session.name) {
		res.redirect('/user/login');
	} else {
		connection.query('select * from projects where url = ?', [req.params.project], function(err, result) {
			if (err) throw err;
			var _project = result[0];
			connection.query('select * from project_entries where pid = ? and id = ?', [req.session.pid, _project.id], function(err, result) {
				if (err) throw err;
				if (result.length == 0) {
					res.redirect('/p/' + req.params.project + '/join');
				} else {
					if (result[0].hangout_url) {
						res.redirect('/p/' + req.params.project);
					} else {
						res.render('project_hangout', {
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
								admin_id: _project.admin_id,
								hangout_url: _project.hangout_url
							},
							csrfToken: req.csrfToken(),
							title: _project.name
						});
					};
				};
			});
		});
	};
});

router.post('/:project/hangout', parseForm, csrfProtection, function(req, res, next) {
	if (!req.session.username) {
		res.json({'status': 'fail', 'err': 'session_expired'});
	} else {
		connection.query('select * from project_entries join projects on projects.id = project_entries.id where pid = ? and url = ?', [req.session.pid, req.params.project], function(err, result) {
			if (err) throw err;
			var _project = result[0];
			if (result.length == 0) {
				res.json({'status': 'fail', 'err': 'permission_denied'});
			} else {
				var url = req.body.url.replace('https://hangoutsapi.talkgadget.google.com/hangouts/_/', '');
				connection.query('update projects set hangout_url = ? where id = ?', [url, result[0].id], function(err, result) {
					if (err) throw err;
					res.json({'status': 'success'});
				});
			}
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
					created_date: moment(result[0].created_date).format('LL'),
					hangout_url: result[0].hangout_url
				},
				title: result[0].name
			});
		});
	};
});

module.exports = router;
