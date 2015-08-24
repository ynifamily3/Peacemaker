var express = require('express');
var router = express.Router();

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

router.post('/:id/accept', parseForm, csrfProtection, function(req, res, next) {
	if (!req.session.name) {
		res.json({
			'status': 'fail',
			'err': 'permission_denied'
		});
	} else {
		connection.query('select * from notifications where id = ? and object_id = ?', [req.params.id, req.session.pid], function(err, result) {
			if (err) throw err;
			if (result.length) {
				if (result[0].type == 101) {
					var request = {
						pid: result[0].subject_id,
						id: result[0].project_id
					};
					connection.query('insert into project_entries set ?', request, function(err, result) {
						if (err) throw err;
						connection.query('delete from notifications where id = ?', [req.params.id], function(err, result) {
							if (err) throw err;
							res.json({
								'status': 'success'
							});
						});
					});
				} else {
					res.json({
						'status': 'fail',
						'err': 'unknown_request'
					});
				};
			} else {
				res.json({
					'status': 'fail',
					'err': 'invalid_request'
				});
			}
		});
	}
});

router.post('/:id/dismiss', parseForm, csrfProtection, function(req, res, next) {
	if (!req.session.name) {
		res.json({
			'status': 'fail',
			'err': 'permission_denied'
		});
	} else {
		connection.query('select * from notifications where id = ? and object_id = ?', [req.params.id, req.session.pid], function(err, result) {
			if (err) throw err;
			console.log(result.length);
			if (result.length != 0) {
				if (result[0].type == 101) {
					connection.query('delete from notifications where id = ?', [req.params.id], function(err, result) {
						if (err) throw err;
						res.json({
							'status': 'success'
						});
					});
				} else {
					res.json({
						'status': 'fail',
						'err': 'unknown_request'
					});
				}
			} else {
				res.json({
					'status': 'fail',
					'err': 'invalid_request'
				});
			}
		});
	}
});

module.exports = router;
