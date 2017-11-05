# Dockerfile for users service

FROM node:6.9.5

MAINTAINER Tony Mutai <tony@gebeya.com>

ADD . /home/users

WORKDIR /home/users

RUN npm install

EXPOSE 8030

ENTRYPOINT ["node", "app.js"]
