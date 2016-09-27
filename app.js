var express = require('express');
var childProcess = require('child_process');
var app = express();
var Slack = require('slack-node');
 
webhookUri_fail = "https://hooks.slack.com/services/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";
webhookUri_success = "https://hooks.slack.com/services/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";

function postSlack(uri, channel, message) {
  slack = new Slack();
  slack.setWebhook(uri);
  
  slack.webhook({
    channel: channel,
    username: "docker-hub-webhook",
    text: message
  }, function(err, response) {
    console.log(response);
  });
};
 
app.post('/', function (req, res) {
  res.send('Hello World!');

  try {
    console.log(childProcess.execSync('/srv/app/docker-images-update.sh', {encoding: 'ASCII', env: process.env, shell: "/bin/bash"}));
    postSlack(webhookUri_success, "#smartcenter2-errors", "Success updating server");
  } catch (error) {
    postSlack(webhookUri_fail, "#smartcenter2-errors", "Error when updating server - " + error);
  }
});

app.listen(80, function () {
  console.log('Listening on port 80.');
});