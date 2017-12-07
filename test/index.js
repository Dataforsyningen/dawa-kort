"use strict";

var express = require('express')
  , kf = require('kf-getticket')
  , rp= require('request-promise');

var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  console.log('get /');
  res.sendFile(__dirname + "/public/index.html", function (err) {
    if (err) {
      console.log(err);
      res.status(404).end();
    }
    else {
      console.log('Sent: index.html');
    }
  });
});

app.get('/getticket', function (req, res, next) { 
  kf.getTicket(usr,pw).then((ticket) => {
    res.status(200).send(ticket);
  })
  .catch((err) => {
    res.status(400).send('Ukendt username og password: ' + err);
  });
}); 


var usr= process.argv[2]
  , pw= process.argv[3]
  , port= process.argv[4];

if (!port) port= 3000;

kf.getTicket(usr,pw).then(ticket => {
  var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('URL http://%s:%s', host, port);
  });
})
.catch(err => {
  console.log("Ukendt username og password (%s)",err);
});