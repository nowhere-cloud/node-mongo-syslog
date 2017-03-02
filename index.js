#!/usr/bin/node

"use strict";

const mongoose = require("mongoose");
const Syslogd = require("syslogd");
const schema = require("./schema.js");

class App {
  constructor(mongodb_uri) {
    mongoose.connect(mongodb_uri);
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "MongoDB Connection Error: "));
    db.once("open", () => {
      console.log("MongoDB Connection Established.");
    });
    this.Model = db.model("Syslog", schema.schema);
  }

  listen() {
    const model = this.Model;
    Syslogd(function(info) {
      model.create(info, (err) => {
        if (err) return console.error.bind(console, err);
      });
    }).listen(514, function(err) {
      console.log("start");
      if (err) return console.error.bind(console, err);
    });
  }
}

const app = new App(process.env.MONGODB_URI);
app.listen();
