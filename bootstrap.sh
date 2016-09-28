#!/bin/bash

source /etc/profile

npm install express \
            slack-node \
            kue \
            body-parser

exec supervisord -c ./supervisord.conf