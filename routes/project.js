var express = require('express');
var router = express.Router();

var mysql      = require('mysql');
var connection = mysql.createConnection({
	host     : 'localhost',
	port     : 3306,
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

function phone_format(num) {
	return num.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/,"$1-$2-$3");
}

router.get('/:project', function(req, res, next) {
	if (!req.session.name) {
		res.redirect('/user/login');
	} else {
		connection.query('select * from project_entries join projects on projects.id = project_entries.id where pid = ? and url = ?', [req.session.pid, req.params.project], function(err, result) {
			if (err) {throw err;}
			if (result.length === 0) {
				res.redirect('/p/' + req.params.project + '/join');
			} else {
				res.render('project_index', {
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
						hangout_url: result[0].hangout_url
					},
					title: result[0].name
				});
			}
		});
	};
});

router.get('/:project/contact', function(req, res, next) {
	if (!req.session.name) {
		res.redirect('/user/login');
	} else {
		connection.query('select * from project_entries join projects on projects.id = project_entries.id where pid = ? and url = ?', [req.session.pid, req.params.project], function(err, result) {
			if (err) throw err;
			if (result.length == 0) {
				res.redirect('/p/' + req.params.project + '/join');
			} else {
				connection.query('select * from users join project_entries on users.pid = project_entries.pid where id = ?', [result[0].id], function(err, users_result) {
					if (err) throw err;
					res.render('project_contact', {
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
							hangout_url: result[0].hangout_url
						},
						title: result[0].name,
						users: users_result
					});
				});
			};
		});
	};
});

router.get('/:project/contact/vcard', function(req, res, next) {
	if (!req.session.name) {
		res.redirect('/user/login');
	} else {
		connection.query('select * from project_entries join projects on projects.id = project_entries.id where pid = ? and url = ?', [req.session.pid, req.params.project], function(err, result) {
			if (err) throw err;
			if (result.length == 0) {
				res.redirect('/p/' + req.params.project + '/join');
			} else {
				connection.query('select name, phone, mail from users join project_entries on users.pid = project_entries.pid where id = ?', [result[0].id], function(err, users_result) {
					if (err) throw err;
					res.setHeader('Content-disposition', 'attachment; filename=export.vcf');
					res.setHeader('Content-type', 'text/vcard');
					res.render('project_contact_vcard', {
						users: users_result
					});
				});
			};
		});
	};
});

router.get('/:project/calendar', function(req, res, next) {
	if (!req.session.name) {
		res.redirect('/user/login');
	} else {
		connection.query('select * from project_entries join projects on projects.id = project_entries.id where pid = ? and url = ?', [req.session.pid, req.params.project], function(err, result) {
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
						id: result[0].id,
						url: result[0].url,
						name: result[0].name,
						desc: result[0].desc,
						admin_id: result[0].admin_id,
						hangout_url: result[0].hangout_url
					},
					title: result[0].name,
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
	};
});

router.get('/:project/chat', function(req, res, next) {
	//console.log(req);
	if (!req.session.name) {
		res.redirect('/user/login');
	} else {
		connection.query('select * from project_entries join projects on projects.id = project_entries.id where pid = ? and url = ?', [req.session.pid, req.params.project], function(err, result) {
			if (err) throw err;
			if (result.length == 0) {
				res.redirect('/p/' + req.params.project + '/join');
			} else {
				var ws_url = 'node.niceb5y.net';
				if (process.env.NODE_ENV != 'production') {
					ws_url = 'localhost';
				}
				res.render('project_chat', {
					auth_token: req.sessionID,
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
						hangout_url: result[0].hangout_url
					},
					title: result[0].name,
					room: result[0].id,
					ws_addr: ws_url,
					js: [
						'jquery-scrollto.js',
						'socket.io.js',
						'jquery.form.js'
					],
					css: [
						'chat.css'
					]
				});
			};
		});
	};
});

router.get('/:project/hangout', csrfProtection, function(req, res, next) {
	if (!req.session.name) {
		res.redirect('/user/login');
	} else {
		connection.query('select * from project_entries join projects on projects.id = project_entries.id where pid = ? and url = ?', [req.session.pid, req.params.project], function(err, result) {
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
							id: result[0].id,
							url: result[0].url,
							name: result[0].name,
							desc: result[0].desc,
							admin_id: result[0].admin_id,
							hangout_url: result[0].hangout_url
						},
						csrfToken: req.csrfToken(),
						title: result[0].name
					});
				};
			};
		});
	};
});

router.post('/:project/hangout', parseForm, csrfProtection, function(req, res, next) {
	if (!req.session.username) {
		res.json({'status': 'fail', 'err': 'session_expired'});
	} else {
		connection.query('select * from project_entries join projects on projects.id = project_entries.id where pid = ? and url = ?', [req.session.pid, req.params.project], function(err, result) {
			if (err) throw err;
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
	"use strict";
	if (!req.session.name) {
		res.redirect('/user/login');
	} else {
		connection.query('select * from projects where url = ?', [req.params.project], function(err, result) {
			if (err) {throw err;}
			if(result.length === 0) {
				res.redirect('/dashboard');
				return;
			}
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
	}
});

/*
메모 기능 추가 by. 미즈엘
윈도우즈의 스티커 메모와 같이 메모를 추가할 수도 있다.
*/
router.get('/:project/memo', function(req, res, next) {
	"use strict"; //엄격한 코딩 컨벤션 적용
	if (!req.session.name) {
		res.redirect('/user/login');
		return;
	}
	connection.query('select * from projects where url = ?', [req.params.project], function(err, res2) {
		if(res2.length) {
			res.render('project_memo', {
				user: {
					name: req.session.name,
					username: req.session.username,
					pid: req.session.pid
				},
				project: {
					id: res2[0].id,
					url: res2[0].url,
					name: res2[0].name,
					desc: res2[0].desc,
					admin_id: res2[0].admin_id,
					hangout_url: res2[0].hangout_url
				},
				title: res2[0].name,
				js: [
					'memo.js'
				],
				css: [
					'memo.css'
				]
			});
			return;
		}
		else {
			res.writeHead(200, {'content-type':'text/html'});
			res.end('<h1>접근할 수 없는 포틀릿입니다.</h1>');
		}
	});

});

router.post('/:project/memo', function(req, res, next) {
	"use strict";
	if (!req.session.name) {
		res.redirect('/user/login');
		return;
	}
	connection.query('select * from project_entries where pid = ? and id = ?', [req.session.pid, req.body.project], function(err, res2) {
		if(res2.length) {
			var data = {
				project : req.body.project,
				color : req.body.color,
				is_finished : false,
				writer : ""+req.session.pid,
				content : req.body.content
			};
			connection.query('insert into memo_content set ?', data, function(err, result) {
				if (err) {throw err;}
				res.writeHead(200, {'content-type' : 'text/html'});
				res.end(JSON.stringify(data));
			});
		} else {
			res.writeHead(200, {'content-type':'text/html'});
			res.end('접근할 수 없는 포틀릿입니다.');
		}
	});


});

module.exports = router;
