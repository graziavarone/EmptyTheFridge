var request = require('request')

const API_KEY = process.env.API_KEY

function sendMail(ingredient, messageFormatted) {
    request({
        url: ' https://maker.ifttt.com/trigger/alertVeg/with/key/'+API_KEY,
        qs: {
            "value1": ingredient,
            "value2": messageFormatted,

        },
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }, function (error, response, body) {
        if (error) {
            console.log(error);
        } else {
            console.log(response.statusCode, body);
        }
    });
}

function bin2string(array) {
    var result = "";
    for (var i = 0; i < array.length; ++i) {
        result += (String.fromCharCode(array[i]));
    }
    return result;
}

function split_recipes(message) {
    const recipes = message.split('\n').map(x => x.trim());
    return recipes;
}

function format_message(recipes) {
    let messageFormatted = ''
    for (i = 0; i < recipes.length; i++) {
        messageFormatted = messageFormatted + recipes[i] + "<br>"
    }
    return messageFormatted;
}

exports.handler = function (context, event) {
    var _event = JSON.parse(JSON.stringify(event));
    var _data = bin2string(_event.body.data);
    context.callback("feedback " + _data);
    const messageWithIngredient = _data.split(',').map(x => x.trim());
    if (messageWithIngredient[1] !== '') {
        console.log("Sending an email")
        const recipes = split_recipes(messageWithIngredient[1])
        const messageFormatted = format_message(recipes)
        sendMail(messageWithIngredient[0], messageFormatted);
    }

};
