#!/usr/bin/env node

"use strict";

const AMQP = require("amqplib");
const mongoose = require("mongoose");
const schema = require("./schema.js");
const moment = require("moment");

/**
 * AMQP Access
 *
 * @class Rabbit
 */
class Rabbit {
    /**
     * Creates an instance of Rabbit.
     *
     * @returns {void}
     * @memberOf Rabbit
     */
    constructor(amqpd_uri, mongo_uri) {
        this.AURI = amqpd_uri;
        mongoose.connect(mongo_uri);
        const db = mongoose.connection;
        db.on("error", console.error.bind(console, "MongoDB Connection Error: "));
        db.once("open", () => {
            console.log("MongoDB Connection Established.");
        });
        this.Model = db.model("Syslog", schema.schema);
        this.target = "syslog-out";
        this.listen = "syslog-in";
    }

    /**
     * Publish message
     *
     * @param {any} msg message object
     * @returns {void}
     * @memberOf Rabbit
     */
    writeMessage(msg, msg_id) {
        const target = this.target;
        AMQP.connect(this.AURI).then((conn) => conn.createChannel().then(
        (ch) => {
            let q = ch.assertQueue(target, {durable: true});
            return q.then((_qok) => {
                ch.sendToQueue(target, new Buffer.from(JSON.stringify(msg)), {
                    correlationId: msg_id
                });
                return ch.close();
            });
        }).finally(() => {
            conn.close();
        })).catch(console.warn);
    }

    /**
     * message receiver
     *
     * @returns {void}
     * @memberOf Rabbit
     */
    receiveMessage() {
        const listen = this.listen;
        const processor = this.processor;
        AMQP.connect(this.AURI).then((conn) => conn.createChannel().then(
        (ch) => {
            let q = ch.assertQueue(listen, {durable: true});
            q = q.then(() => {
                ch.consume(listen, processor, { noAck: true });
                console.log("RabbitMQ Attached");
            });
            return q;
        })).catch(console.warn);
    }

    processor(msgRAW) {
        const model = this.Model;
        let msg = JSON.parse(msgRAW.content.toString());
        let payload = msg["payload"];
        let result = (() => {
            // https://stackoverflow.com/questions/8965043/switch-unexpected-token-in-javascript
            switch (msg["task"]) {
            case "get.all":
                return model.find({}).sort({time: "desc"});
            case "get.one":
                return model.find({"_id" : msg["payload"]["id"] });
            }
        });
        let returning = {
            seq: msg["id"],
            taskid: msg["uuid"],
            timestamp: moment(),
            payload: result
        };
        writeMessage(returning, msgRAW.properties.correlationId.toString());
    }
}

const app = new Rabbit(process.env.AMQP_URI, process.env.MONGODB_URI);
app.receiveMessage();
