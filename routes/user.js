var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (!req.session.username) {
  	res.redirect('/user/login');
  } else {
  	res.redirect('/user/hello')
  }
});

router.get('/login', function(req, res, next) {
	res.render('user_login');
});

router.get('/logout', function(req, res, next) {
	req.session.destroy();
	res.redirect('/user');
});

router.post('/login', function(req, res, next) {
	req.session.username = req.body.username;
	res.redirect('/user');
});

router.get('/hello', function(req, res, next) {
	res.render('user_hello', {name:req.session.username});
});

module.exports = router;
