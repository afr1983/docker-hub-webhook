FROM debian:jessie

RUN apt-get update && \
    apt-get install -y \
      ca-certificates \
      dnsutils \
      netcat \
      supervisor \
      sudo \
      tcpdump \
      unzip \
      wget \
      net-tools \
      locales \
      curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN wget -qO- https://get.docker.com/ | sh

RUN curl -sL https://deb.nodesource.com/setup_6.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN wget https://github.com/docker/compose/releases/download/1.7.1/docker-compose-Linux-x86_64 -nv -O /usr/bin/docker-compose && \
    chmod +x /usr/bin/docker-compose

WORKDIR /srv/app
COPY . /srv/app

RUN npm install express && \
    npm install slack-node

ENTRYPOINT ["/srv/app/bootstrap.sh"]