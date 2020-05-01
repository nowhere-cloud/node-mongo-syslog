#!/usr/bin/node

'use strict';

const mongoose = require('mongoose');
const Syslogd = require('syslogd');
const Syslog = require('./schema.js');
const bluebird = require('bluebird');
const debug = require('debug')('syslogd');

/**
 * Application Core
 */
class App {
  /**
   * Defining how the Syslog Storage Works.
   * All data will goes to a Collection called as 'syslog'.
   * Absolutely, these code are from the Quickstart of Mongoose.
   * @param mongodb_uri mongodb://server/database
   */
  constructor(mongodb_uri) {
    mongoose.connect(mongodb_uri);
    mongoose.Promise = bluebird;
    const db = mongoose.connection;
    db.on('error', (err) => {
      throw new Error('MongoDB Connection Error: ' + err);
    });
    db.once('open', () => {
      debug('MongoDB Connection Established.');
    });
  }

  listen() {
    /**
     *  This is where all the syslog logic goes.
     *  The Syslog parser will pare the incoming log into a specified dataset
     *  Format documented at 'schema.js', and exposed to `info`
     */
    Syslogd(function(info) {
      if (isNaN(info.severity)) {
        info.severity = 7;
      }
      var log = new Syslog(info);
      /* Debug Function */
      /* Since the dataset format is good enough. It will pumped into MongoDB Directly. */
      log.save((err) => {
        if (err) {
          throw new Error(err);
        }
      });
    }).listen(514, function(err) {
      /* Indicating the Syslog Collector has been started correctly */
      debug('start');
      /* Also, Error Handling. */
      if (err) {
        throw new Error(err);
      }
    });
  }
}

const app = new App(process.env.MONGODB_URI);
app.listen();
