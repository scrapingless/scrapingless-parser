var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var parseRouter = require('./routes/parser');
var browserRouter = require('./routes/browser');
var conf = require('./config.json');
var bodyParser = require('body-parser');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.text({ type: 'text/plain', limit : "25mb" }))
//TEXT/PLAIN
/*app.use(function(req, res, next){
    if (req.is('text/*')) {
      req.text = '';
      req.setEncoding('utf8');
      req.on('data', function(chunk){ req.text += chunk });
      req.on('end', next);
    } else {
      next();
    }
  });*/

  
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static('public'));
app.use('/', indexRouter);
app.use('/', parseRouter);
app.use('/', browserRouter);

module.exports = app;