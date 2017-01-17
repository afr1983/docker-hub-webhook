#!/bin/bash

source /etc/profile

set -e

docker inspect --format='{{ index .Config.Labels "com.callix.source-commit" }}' rails-1