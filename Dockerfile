# Dockerfile for bidir staging env't users service
FROM node:10.15.3

MAINTAINER Teferi Assefa <teferi.assefa@gmail.com>

ADD . /usr/src/app 

WORKDIR /usr/src/app

RUN npm install

EXPOSE 8030

ENTRYPOINT ["node", "app.js"]

