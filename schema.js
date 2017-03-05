"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
/**
 * This is the Syslog parser parsed format.
 * @type Hash
 */
exports.schema = Schema({
    facility: Number,
    severity: Number,
    tag: {
        type: [String],
        index: true
    },
    time: Date,
    hostname: {
        type: [String],
        index: true
    },
    address: String,
    family: String,
    port: Number,
    size: Number,
    msg: String
}, {
    capped: 2048
});
