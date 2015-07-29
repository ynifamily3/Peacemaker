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

router.get('/:user', function(req, res, next) {
	connection.query('select * from users where username = ?', [req.params.user], function(err, result) {
		if (err) throw err;
		var date = new Date(result[0].register_date);
		var dateString = date.getFullYear() + '년 ' + (date.getMonth() + 1) + '월';
		res.render('user_user', {
			name: req.session.name,
			username: req.session.username,
			user_name: result[0].name,
			register_date: dateString
		});
	});
});

module.exports = router;
