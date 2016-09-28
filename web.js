var express = require('express');
var bodyParser = require('body-parser');
var kue = require('kue');

var queue = kue.createQueue();

var app = express();

process.on('SIGTERM', function (sig) {
  process.exit(0);
});

app.use(bodyParser.json()); 

app.post('/', function (req, res) {
  var image = req.body["repository"]["repo_name"] + ":" + req.body["push_data"]["tag"];
  console.log("Received - " + image);
  queue.create('update-server', {image: image}).save();
  res.send('OK');
});

app.listen(80, function () {
  console.log('Listening on port 80.');
});