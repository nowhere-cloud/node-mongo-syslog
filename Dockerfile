FROM node:alpine

COPY index.js /srv

COPY schema.js /srv

COPY package.json /srv

COPY bootstrapper.sh /srv

WORKDIR /srv

RUN chmod a+x bootstrapper.sh npm install

EXPOSE 514

ENV MONGODB_URI mongodb://mongo/nowhere

ENTRYPOINT ["/srv/bootstrapper.sh"]
