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

queue.process('update-docker', function (job, done) {
  try {
    console.log("Update-Docker Worker - starting job - " + job.data.image);
    var result = childProcess.execSync('/srv/app/docker-images-update.sh ' + job.data.image, {encoding: 'ASCII', env: process.env, shell: "/bin/bash"});
    console.log("Success - " + result);
    var slackMsg = "Success updating docker image - " + job.data.image;
    if (job.data.repo == "callix/sc2-rails") {
      var result = childProcess.execSync('/srv/app/docker-get-rails-commit.sh');
      slackMsg += " - https://github.com/callixbrasil/smartcenter2-infra/commit/" + result;
    }
    postSlack("#smartcenter2-errors", slackMsg);
    done();
  } catch (error) {
    console.log("Error - " + error);
    postSlack("#smartcenter2-errors", "Error when updating docker image - " + error);
    done(error);
  }
});

queue.process('update-infra', function (job, done) {
  try {
    console.log("Update-Infra Worker - starting job - " + job.data.repo);
    var result = childProcess.execSync('/srv/app/infra-github-pull.sh', {encoding: 'ASCII', env: process.env, shell: "/bin/bash"});
    console.log("Success - " + result);
    postSlack("#smartcenter2-errors", "Success updating " + job.data.repo + " - " + job.data.message + " - " + job.data.url);
    done();
  } catch (error) {
    console.log("Error - " + error);
    postSlack("#smartcenter2-errors", "Error when updating " + job.data.repo + " - " + error);
    done(error);
  }
});