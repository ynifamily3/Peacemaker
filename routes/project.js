var express = require('express');
var router = express.Router();
var htmlspecialchars = require('htmlspecialchars');

var mysql = require('mysql');
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

var googl = require('goo.gl');
googl.setKey('AIzaSyAzO33Wf2kgQLTLxjkyfE5RXjp1kuysT6Q');

function phone_format(num) {
	return num.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/,"$1-$2-$3");
}

router.get('/:project', csrfProtection, function(req, res, next) {
	if (!req.session.name) {
		res.redirect('/user/login/back');
	} else {
		connection.query('select * from project_entries join projects on projects.id = project_entries.id where pid = ? and url = ?', [req.session.pid, req.params.project], function(err, result) {
			if (err) throw err;
			if (result.length === 0) {
				res.redirect('/p/' + req.params.project + '/join');
			} else {
				connection.query('select *, projects.name as `title`, notifications.id as `notification_id` from notifications join projects on projects.id = notifications.project_id join users on users.pid = notifications.subject_id where object_id = ? and project_id = ?', [req.session.pid, result[0].id], function(err, notification_result) {
					if (err) throw err;
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
						csrfToken: req.csrfToken(),
						notifications: notification_result,
						title: result[0].name
					});
				});
			}
		});
	}
});

router.get('/:project/contact', function(req, res, next) {
	if (!req.session.name) {
		res.redirect('/user/login/back');
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
			}
		});
	}
});

router.get('/:project/contact/vcard', function(req, res, next) {
	if (!req.session.name) {
		res.redirect('/user/login/back');
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
			}
		});
	}
});

router.get('/:project/calendar', function(req, res, next) {
	if (!req.session.name) {
		res.redirect('/user/login/back');
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
			}
		});
	}
});

router.get('/:project/chat', csrfProtection, function(req, res, next) {
	if (!req.session.name) {
		res.redirect('/user/login/back');
	} else {
		connection.query('select * from project_entries join projects on projects.id = project_entries.id where pid = ? and url = ?', [req.session.pid, req.params.project], function(err, result) {
			if (err) throw err;
			if (result.length == 0) {
				res.redirect('/p/' + req.params.project + '/join');
			} else {
				var ws_url = 'pm.niceb5y.net';
				if (process.env.NODE_ENV != 'production') {
					ws_url = '127.0.0.1';
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
					csrfToken: req.csrfToken(),
					js: [
						'moment.js',
						'jquery-scrollto.js',
						'socket.io.js',
						'jquery.form.js',
						'autolink.js'
					],
					css: [
						'chat.css'
					]
				});
			}
		});
	}
});

router.post('/:project/chat', parseForm, csrfProtection, function(req, res, next) {
	//send모드 : 유저가 전달한 내용을 database에 저장하고 생성된 시그니처를 돌려준다.
	//receive모드 : 시그니처를 기반으로 data를 찾아 돌려준다.
	//req.body ~ 로 post variable를 받을 수 있다.
	/*
	받아들이는 변수 목록
		mode : send / receive
		send 의 경우  {
			type : File / PlainText / notification
			content : FileSigniture / message / message
		}
		receive 의 경우 {
			signiture : Signiture Value
		}
	*/
	//수정 : 시그니처 생성 대신 그냥 메모의 Primary Key를 가져다 쓰기로 함.
	//기본적인 권한 체크
	if (!req.session.name) {
		res.redirect('/user/login/back');
	} else if ( req.session.pid != req.body.myid || req.session.name != req.body.myname ) {
		res.status(500); 
		res.render('error', {
				message: 'Bad Request',
				error: {}
		});
	} else {
		connection.query('select * from project_entries join projects on projects.id = project_entries.id where pid = ? and url = ?', [req.session.pid, req.params.project], function(err, result) {
			if (err) throw err;
			if (result.length == 0) {
				res.redirect('/p/' + req.params.project + '/join');
			} else {
				//인증 통과
				if (req.body.mode == "send") {
					//유저가 채팅 내용을 전송했다. 데이터베이스에 저장 후 시그니처-Primary Key-를 생성 후 돌려준다.
					var today = new Date();
					var year = today.getFullYear();
					var month = today.getMonth() + 1;
					var day = today.getDate();
					var queries;
					if(req.body.type == "File") {
						queries = {
							project_id : result[0].id,
							type : req.body.type,
							content : req.body.content,
							original : req.body.original,
							size : req.body.size,
							writer: req.session.pid
						};
						
					} else {
						queries = {
							project_id : result[0].id,
							type : req.body.type,
							content : req.body.content,
							writer: req.session.pid
						};
					}
					connection.query('insert into chatting_content set ?', queries, function (err, result2) {
						res.json({signiture:result2.insertId});
					});
					
				} else if (req.body.mode == "receive") {
					//시그니쳐를 해석해서 데이터로 돌려준다
					//type과 content를 돌려준다. + 기타 데이터도 돌려줘
					//writer로 닉네임을 찾아 돌려준다.
					connection.query('select * from chatting_content join users on chatting_content.writer = users.pid where num = ?', [req.body.signiture], function(err, result2) {
						res.json({type:result2[0].type, content:result2[0].content, writer:result2[0].writer, writer_name:result2[0].name, date:result2[0].created_date, original:result2[0].original, size:result2[0].size});
					});
				} else {
					res.status(500); 
					res.render('error', {
							message: 'Bad Request',
							error: {}
					});
				}
			}
		});
	}
});

router.post('/:project/chat/history', parseForm, csrfProtection, function (req,res,next) {
	if (!req.session.name) {
		res.redirect('/user/login/back');
	} else {
		var pid;
		connection.query('select * from project_entries join projects on projects.id = project_entries.id where pid = ? and url = ?', [req.session.pid, req.params.project], function(err, result) {
			if (err) throw err;
			pid = result[0].id;
			if (result.length == 0) {
				res.redirect('/p/' + req.params.project + '/join');
			} else {
				connection.query('select * from chatting_content join users on chatting_content.writer = users.pid where project_id = ?', [pid], function (err, result) {
					if (err) throw err;
					res.json(result);
				});
			}
		});
	}
});

router.get('/:project/hangout', csrfProtection, function(req, res, next) {
	if (!req.session.name) {
		res.redirect('/user/login/back');
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
				}
			}
		});
	}
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
	}
});

router.get('/:project/join', csrfProtection, function(req, res, next) {
	if (!req.session.name) {
		res.redirect('/user/login/back');
	} else {
		connection.query('select * from projects where url = ?', [req.params.project], function(err, project_result) {
			if (err) throw err;
			if(project_result.length == 0) {
				res.redirect('/dashboard');
			} else {
				connection.query('select * from project_entries where pid = ? and id = ?', [req.session.pid, project_result[0].id], function(err, result) {
					if (err) throw err;
					if (result.length == 0) {
						connection.query('select * from notifications where subject_id = ? and project_id = ? and type = 101', [req.session.pid, project_result[0].id], function(err, result) {
							if (err) throw err;
							res.render('project_join', {
								user: {
									name: req.session.name,
									username: req.session.username,
									pid: req.session.pid
								},
								project: {
									id: project_result[0].id,
									url: project_result[0].url,
									name: project_result[0].name,
									desc: project_result[0].desc,
									admin_id: project_result[0].admin_id,
									created_date: moment(project_result[0].created_date).format('LL'),
									hangout_url: project_result[0].hangout_url
								},
								requested: result.length,
								csrfToken: req.csrfToken(),
								title: project_result[0].name
							});
						});
					} else {
						res.redirect('/p/' + req.params.project);
					}
				});
			}
		});
	}
});

router.post('/:project/join', parseForm, csrfProtection, function(req, res, next) {
	if (!req.session.name) {
		res.json({
			'status': 'fail',
			'err': 'permission_denied'
		});
	} else {
		connection.query('select * from projects where url = ?', [req.params.project], function(err, project_result) {
			if (err) throw err;
			if(project_result.length == 0) {
				res.json({
					'status': 'fail',
					'err': 'permission_denied'
				});
			} else {
				connection.query('select * from notifications where subject_id = ? and project_id = ? and type = 101', [req.session.pid, project_result[0].id], function(err, result) {
					if (err) throw err;
					if (result.length == 0) {
						var request = {
							subject_id: req.session.pid,
							object_id: project_result[0].admin_id,
							project_id: project_result[0].id,
							type: 101
						};
						connection.query('insert into notifications set ?', request, function(err, result) {
							if (err) throw err;
							res.json({
								'status': 'success'
							});
						});
					} else {
						res.json({
							'status': 'fail',
							'err': 'duplicate_request'
						});
					}
				});
			}
		});
	}
});

router.post('/:project/join/cancel', parseForm, csrfProtection, function(req, res, next) {
	if (!req.session.name) {
		res.json({
			'status': 'fail',
			'err': 'permission_denied'
		});
	} else {
		connection.query('select * from projects where url = ?', [req.params.project], function(err, project_result) {
			if (err) throw err;
			if(project_result.length == 0) {
				res.json({
					'status': 'fail',
					'err': 'permission_denied'
				});
			} else {
				connection.query('delete from notifications where subject_id = ? and project_id = ? and type = 101', [req.session.pid, project_result[0].id], function(err, result) {
					if (err) throw err;
					res.json({
						'status': 'success'
					});
				});
			}
		});
	}
});

router.get('/:project/memo', csrfProtection, function(req, res, next) {
	if (!req.session.name) {
		res.redirect('/user/login/back');
		return;
	}
	connection.query('select * from project_entries join projects on projects.id = project_entries.id where pid = ? and url = ?', [req.session.pid, req.params.project], function(err, result) {
		if (err) throw err;
		if(result.length == 0) {
			res.redirect('/p/' + req.params.project + '/join');
		} else {
			res.render('project_memo', {
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
				title: result[0].name,
				js: [
					'autolink.js'
				],
				css: [
					'memo.css'
				]
			});
		}
	});
});

router.post('/:project/memo', function(req, res, next) {
	if (!req.session.name) {
		res.redirect('/user/login/back');
		return;
	}
	connection.query('select * from project_entries join projects on projects.id = project_entries.id where pid = ? and url = ?', [req.session.pid, req.params.project], function(err, result) {
		if(result.length == 0) {
			res.json({});
		} else {
			var data = {
				project: result[0].id,
				color: req.body.color,
				is_finished: false,
				writer: req.session.pid,
				content: req.body.content
			}
			connection.query('insert into memo_content set ?', data, function(err, result) {
				if (err) throw err;
				res.json({
					'status': 'success',
					'id': result.insertId
				});
			});
		}
	});
});

router.post('/:project/memo/url', function(req, res, next) {
	if (!req.session.name) {
		res.redirect('/user/login');
		return;
	}
	connection.query('select * from project_entries join projects on projects.id = project_entries.id where pid = ? and url = ?', [req.session.pid, req.params.project], function(err, result) {
		if(result.length == 0) {
			res.json({});
		} else {
			var url = req.body.content;
			if (url.length >= 140) {
				googl.shorten(url)
						.then(function (shortUrl) {
							var data = ({
								project: result[0].id,
								color: req.body.color,
								is_finished: false,
								writer: req.session.pid,
								content: '[자동 저장] ' + shortUrl
							});
							connection.query('insert into memo_content set ?', data, function(err, result) {
								if (err) throw err;
								res.json({
									'status': 'success',
									'id': result.insertId
								});
							});
						})
						.catch(function (err) {
							console.error(err.message);
						});
			} else {
				var data = ({
					project: result[0].id,
					color: req.body.color,
					is_finished: false,
					writer: req.session.pid,
					content: '[자동 저장] ' + url
				});
				connection.query('insert into memo_content set ?', data, function(err, result) {
					if (err) throw err;
					res.json({
						'status': 'success',
						'id': result.insertId
					});
				});
			}
		}
	});
});

router.post('/:project/memo/:page', parseForm, csrfProtection, function(req, res, next) {
	if (!req.session.name) {
		res.json({'status': 'fail', 'err': 'permission_denied'});
		return;
	}
	connection.query('select * from project_entries join projects on projects.id = project_entries.id where pid = ? and url = ?', [req.session.pid, req.params.project], function(err, result) {
		if (err) throw err;
		if(result.length == 0) {
			res.json({});
		} else {
			if(req.params.page % 1 !== 0 || req.params.page < 1 || !validator.isNumeric(req.params.page)) {
				req.params.page = 1;
			}
			connection.query('select * from memo_content join users on users.pid = memo_content.writer where project = ? order by memo_id desc limit ?,10', [result[0].id, (req.params.page - 1) * 10], function(err, result) {
			if (err) throw err;
				res.json({
					'status': 'success',
					'memo': result
				});
			});
		}
	});
});

router.post('/:project/memo/check/:id', parseForm, csrfProtection, function (req, res, next) {
	if (!req.session.name) {
		res.json({'status': 'fail', 'err': 'permission_denied'});
		return;
	}
	connection.query('select * from project_entries join projects on projects.id = project_entries.id where pid = ? and url = ?', [req.session.pid, req.params.project], function(err, result) {
		if (err) throw err;
		if(result.length == 0) {
			res.json({});
		} else {
			connection.query('select is_finished from memo_content where memo_id = ?', [req.params.id], function (err, result) {
				var is_finished = result[0].is_finished ? 0 : 1;
				connection.query('update memo_content set is_finished = ? where memo_id = ?', [is_finished, req.params.id], function (err, result) {
					res.json({
						'is_finished': is_finished
					});
				});	
			});
		}
	});
});

module.exports = router;
