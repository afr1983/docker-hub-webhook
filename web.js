var express = require('express');
var bodyParser = require('body-parser');
var kue = require('kue');

var queue = kue.createQueue();

var app = express();

process.on('SIGTERM', function (sig) {
  console.log("Web - shutdown");
  process.exit(0);
});

app.use(bodyParser.json()); 

app.post('/', function (req, res) {
  var image = req.body["repository"]["repo_name"] + ":" + req.body["push_data"]["tag"];
  console.log("Web - received Docker Hub request - " + image);
  queue.create('update-server', {image: image}).save();
  res.send('OK');
});

app.listen(80, function () {
  console.log('Web - listening on port 80.');
});