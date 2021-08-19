var amqp = require('amqplib');

const IP = process.env.IP;

function send_feedback(msg) {
    var q = 'iot/ingredientLogger';
    amqp.connect(`amqp://guest:guest@${IP}:5672`).then(function (conn) {
        return conn.createChannel().then(function (ch) {
            var ok = ch.assertQueue(q, { durable: false });
            return ok.then(function (_qok) {
                ch.sendToQueue(q, Buffer.from(msg));
                console.log(" [x] Sent '%s'", msg);
                return ch.close();
            });
        }).finally(function () {
            conn.close();
        });
    }).catch(console.warn);
}

function bin2string(array) {
    var result = "";
    for (var i = 0; i < array.length; ++i) {
        result += (String.fromCharCode(array[i]));
    }
    return result;
}

exports.handler = function (context, event) {
    var _event = JSON.parse(JSON.stringify(event));
    var _data = bin2string(_event.body.data);
    context.callback("feedback " + _data);
    console.log("TRIGGER " + _data);
    send_feedback(_data);
};