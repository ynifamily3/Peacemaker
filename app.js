/* global config */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var htmlspecialchars = require('htmlspecialchars');
var routes = require('./routes/index');
var project = require('./routes/project');
var projects = require('./routes/projects');
var user = require('./routes/user');
var users = require('./routes/users');

var app = express();

var server = app.listen(8080);

config = require('./config');

// view engine setup
app.set('views', path.join( __dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    cookie: {maxAge: 1800000},
    secret: '98bec3f956899257d0f02ae3810aa0f2',
    resave: false,
    saveUninitialized: true
}));

//var RedisStore = require('connect-redis')(session);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {

    socket.on('join_the_room', function(data) {
        //해당 프로젝트의 소속인지를 체크한다.
        console.log ('클라한테 받은 체크데이터 : ' + data.auth);

        socket.join(data.room); //채팅방에 입장한다. (소켓 수신 한정자)

        socket.emit('receive_msg', {id: '운영자', type: 'notification', message: '<center><b> ★★' + data.name + '님이 입장하셨습니다. ★★</b></center>'}); //누군가 접속함을 알림(자기 자신)
        socket.in(data.room).emit('receive_msg', {id: '운영자', type: 'notification', message: '<center><b> ★★' + data.name + '님이 입장하셨습니다. ★★</b></center>'}); //누군가 접속함을 알림 (브로드캐스팅)
    });
    socket.on('sendMessage', function(data) {

        if(data.type === 'File') {
            data.rel = 'me';
            socket.emit('receive_msg', data); //자신클라이언트한테 이밋한다.
            data.rel = 'another';
            socket.in(data.room).emit('receive_msg', data); //타인클라이언트 (룸)한테 이밋한다.
        } else {
            data.message = htmlspecialchars(data.message);
            data.rel = 'me';
            socket.emit('receive_msg', data); //자신클라이언트한테 이밋한다.
            data.rel = 'another';
            data.message = '<b>' + data.name + ' : </b>' +  data.message;
            socket.in(data.room).emit('receive_msg', data); //타인클라이언트 (룸)한테 이밋한다.
        }
    });
});



app.use('/', routes);
app.use('/user', users);
app.use('/u', user);
app.use('/project', projects);
app.use('/p', project);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
