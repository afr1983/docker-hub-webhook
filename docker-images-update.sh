#!/bin/bash

source /etc/profile

set -e

docker login -u callixmachine -p U8etUxUszAU7GJRV
docker pull $1
docker logout

docker-start

docker inspect fs