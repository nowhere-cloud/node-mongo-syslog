FROM node:alpine

WORKDIR /srv

COPY . /srv

RUN apk add --no-cache supervisor \
 && npm install

EXPOSE 514/tcp 514/udp

ENV MONGODB_URI mongodb://mongo/nowhere

ENTRYPOINT ["npm", "run-script", "syslogd", "--production"]
