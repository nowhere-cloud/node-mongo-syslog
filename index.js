#!/usr/bin/node

"use strict";

const mongoose = require("mongoose");
const Syslogd = require("syslogd");

class App {
    constructor(mongodb_uri) {
        mongoose.connect(mongodb_uri);
        const db = mongoose.connection;
        db.on("error", console.error.bind(console, 'MongoDB Connection Error: '));
        db.once("open", () => {
            console.log("MongoDB Connection Established.");
        });
        this.Syslog = db.model('Syslog', require('./schema.js').schema);
    }

    listen() {
        Syslogd(function(info) {
          this.Syslog.create(info, (err, log) => {
            if (err) return console.error.bind(console, err);
          });
        }).listen(514, function(err) {
            console.log('start')
        });
    }
}

const app = new App(process.env.MONGODB_URI);
app.start();
