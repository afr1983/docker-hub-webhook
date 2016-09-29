var childProcess = require('child_process');
var slack = require('slack-node');
var kue = require('kue');

var queue = kue.createQueue();
 
var webhookUri_fail = "https://hooks.slack.com/services/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";
var webhookUri_success = "https://hooks.slack.com/services/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";

function postSlack(uri, channel, message) {
  var slackWebHook = new slack();
  slackWebHook.setWebhook(uri);
  slackWebHook.webhook({
    channel: channel,
    username: "docker-hub-webhook",
    text: message
  }, function(err, response) {
    console.log(response);
  });
};

process.on('SIGTERM', function (sig) {
  queue.shutdown( 5000, function(err) {
    console.log( 'Worker - shutdown: ', err ||'' );
    process.exit( 0 );
  });
});

console.log("Worker - starting job processing");

queue.process('update-server', function (job, done) {
  try {
    console.log("Worker - starting job - " + job.data.image);
    var result = childProcess.execSync('/srv/app/docker-images-update.sh ' + job.data.image, {encoding: 'ASCII', env: process.env, shell: "/bin/bash"});
    console.log(result);
    postSlack(webhookUri_success, "#smartcenter2-errors", "Success updating server");
    done();
  } catch (error) {
    postSlack(webhookUri_fail, "#smartcenter2-errors", "Error when updating server - " + error);
    done(error);
  }
});