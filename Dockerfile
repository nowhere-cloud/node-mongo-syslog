FROM node:alpine

COPY index.js /srv

COPY schema.js /srv

COPY package.json /srv

COPY bootstrapper.sh /srv

WORKDIR /srv

RUN npm install

EXPOSE 514

ENTRYPOINT ["/srv/bootstrapper.sh"]
