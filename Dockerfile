FROM node:alpine

WORKDIR /srv

COPY . /srv

RUN npm install

EXPOSE 514

ENV MONGODB_URI mongodb://mongo/nowhere

CMD [ "npm", "start" ]
