var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//kéo các thứ hãng thứ 3 viêt
var expressLayouts = require('express-ejs-layouts');
const flash = require('express-flash-notification'); // hiện thông báo
const session = require('express-session');

//kéo các thứ ta viết vào
var systemConfig = require("./configs/system");
 
// getting-started.js
var mongoose = require('mongoose');
mongoose.connect('mongodb://trandiep:trandiep123@ds111913.mlab.com:11913/traning_nodejs',{ useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', () => console.log('connection error'));
db.once('open', ()=> {
  console.log("connected")
});

//define path để khi trong các file khác ta không phải định lại đường dẫn nữa
global.__base        = __dirname + '/';
global.__path_configs = __base + 'configs/'
//console.log(__base)

var app = express();

// thiết lập để hiện thông báo
app.use(cookieParser());
app.use(session({
    secret: 'aaaaaaa',    //có thể dặt 1 giá trị ngẫu nhiên
    resave: false,
    saveUninitialized: true,   
}));
app.use(flash(app));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//tạo 1 biến prefixAdmin để thi thoảng ta thay đổi đường dẫn
app.locals.systemConfig = systemConfig;
 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//khai báo các router
app.use(`(/${systemConfig.prefixAdmin})?`, require('./routes/backend/home'));
 
//thiêt lập layout được cài vào
app.use(expressLayouts);     
app.set('layout', 'backend');

//khai báo các router- viết trực tiếp
// app.use('/admin', indexRouter);
// app.use('/admin/dashboard', require('./routes/backend/dashboard'));  //viết trực tiếp
// app.use('/admin/items', itemsRouter); 

//khai báo các router tách thành 1 file riêng
app.use(`/${systemConfig.prefixAdmin}`, require('./routes/backend/index'))

 
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
 
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { title: 'Page Not Found' });
});


module.exports = app;
