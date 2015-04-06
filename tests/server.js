/**
 * Created by Â·¼Ñ on 2015/4/7.
 */
var express = require('express')
  , bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.set('Content-type', 'application/json');
  res.set('Access-Control-Allow-Origin', 'http://localhost:63300');
  res.set('Access-Control-Allow-Credentials', 'true');

  next();
});

app.post('/', function (req, res) {
  res.json({
    code: 0,
    msg: 'ok'
  });
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('visit at http://%s:%s', host, port);
});