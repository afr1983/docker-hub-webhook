var childProcess = require('child_process');
var slack = require('slack-node');
var kue = require('kue');

var queue = kue.createQueue();
 
function postSlack(channel, message) {
  var slackWebHook = new slack();
  slackWebHook.setWebhook("https://hooks.slack.com/services/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");
  slackWebHook.webhook({
    channel: "#smartcenter2-lab4",
    username: "LAB4 Updater",
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
    console.log("Success - " + result);
    postSlack("#smartcenter2-errors", "Success updating server");
    done();
  } catch (error) {
    console.log("Error - " + error);
    postSlack("#smartcenter2-errors", "Error when updating server - " + error);
    done(error);
  }
});