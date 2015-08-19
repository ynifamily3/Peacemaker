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

router.get('/:user', function(req, res, next) {
    if (req.session.username == req.params.user) {
        res.redirect('/user/profile');
        return;
    } else {
        connection.query('select * from users where username = ?', [req.params.user], function(err, result) {
            if (err) throw err;
            res.render('user_user', {
                user: {
                    name: req.session.name,
                    username: req.session.username,
                    pid: req.session.pid
                },
                result: {
                    name: result[0].name,
                    register_date: moment(result[0].register_date).format('LL')
                }
            });
        });
    };
});

module.exports = router;
