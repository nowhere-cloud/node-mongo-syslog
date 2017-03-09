"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
/**
 * This is the Syslog parser parsed format.
 * @type Hash
 * http://stackoverflow.com/questions/33791714/data-type-to-store-time-with-mongoose
 */
const syslogSchemas = new Schema({
    facility: Number,
    severity: Number,
    tag: {
        type: String,
        index: true
    },
    time: String,
    hostname: {
        type: String,
        index: true
    },
    address: String,
    family: String,
    port: Number,
    size: Number,
    msg: String
}, {
    capped: {
        size: 5242880,
        max: 2048,
        autoIndexId: true
    }
});

module.exports = mongoose.model("Syslog", syslogSchemas);
