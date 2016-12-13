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
  console.log(req.body);
  var repo = req.body["repository"]["repo_name"];
  var tag = req.body["push_data"]["tag"];
  var image = repo + ":" + tag;
  console.log("Web - received Docker Hub request - " + image);
  queue.create('update-docker', {repo: repo, tag: tag, image: image}).save();
  res.send('OK');
});

app.post('/github', function (req, res) {
  var ref = req.body["ref"];
  var repo = req.body["repository"]["name"];
  var message = req.body["head_commit"]["message"] + " (" + req.body["head_commit"]["author"]["name"] + ")";
  var url = req.body["head_commit"]["url"];
  console.log("Web - received GitHub request - ref: " + ref + ", repo: " + repo);
  if (ref == "refs/heads/dev" && repo == "smartcenter2-infra") {
    queue.create('update-infra', {ref: ref, repo: repo, message: message, url: url}).save();
  }
  res.send('OK');
});

app.listen(80, function () {
  console.log('Web - listening on port 80.');
});