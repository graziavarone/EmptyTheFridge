const mqtt = require('mqtt')
const https = require('https');

const IP = process.env.IP;
const API_KEY = process.env.API_KEY

const QUEUE_RECIPES = 'iot/recipes';
const QUEUE_ALERT_VEG = 'iot/alertVeg'

let idRecipes = [];
let message = '';
let messageVeg = '';

let buildRequest = function (url, data) {
    const params = typeof data == 'string' ? data : Object.keys(data).map(
        x => `${encodeURIComponent(x)}=${encodeURIComponent(data[x])}`
    ).join('&');
    return `${url}?${params}`;
}

let sendRequest = async function (reqUrl, parameters) {
    return new Promise(function (resolve, reject) {
        https.get(buildRequest(reqUrl, parameters), function (resource) {
            body = ""
            resource.setEncoding('utf8');

            resource.on('end', () => {
                resolve(body);
            });

            resource.on('data', (data) => {
                body += data;
            });

        }).on('error', (err) => {
            reject(err.message);
        })
    })
}

async function getRecipesByIngredient(ingredient) {
    let parameters = {
        apiKey: API_KEY,
        ingredients: ingredient,
        number: 5
    };

    let reqUrl = "https://api.spoonacular.com/recipes/findByIngredients";
    let req = await sendRequest(reqUrl, parameters);
    let jResponse = JSON.parse(req)
    let length = jResponse.length

    setIdRecipes(length, jResponse);
    buildMessageAndSend(ingredient)
}

async function setIdRecipes(length, jResponse) {
    for (let i = 0; i < length; i++) {
        let id = jResponse[i].id;
        idRecipes.push(id);
    }
}

let getRecipeInformation = async function (idRecipe) {
    let parametersRequest = {
        apiKey: API_KEY
    };

    let reqUrl = "https://api.spoonacular.com/recipes/" + idRecipe + "/information";
    let req = await sendRequest(reqUrl, parametersRequest);
    return JSON.parse(req);
}

async function buildMessageAndSend(ingredient) {
    if (idRecipes.length === 0) {
        message = "No recipes found\n"
        send_to_two_topic_mqtt(QUEUE_RECIPES, QUEUE_ALERT_VEG, message, '');
        message = ''
    } else {
        let count = 1;
        let countVeg = 1;
        message = "Recipes with " + ingredient.toLowerCase() + ":\n";

        for (let id of idRecipes) {
            let response = await getRecipeInformation(id)
            message = message + count + ") " + response.title + " - " + response.sourceUrl + "\n"

            if (response.vegetarian === true) {
                messageVeg = messageVeg + countVeg + ") " + response.title + " - " + response.sourceUrl + "\n"
                countVeg = countVeg + 1
            }

            count = count + 1
        }

        send_to_two_topic_mqtt(QUEUE_RECIPES, QUEUE_ALERT_VEG, message, ingredient + "," + messageVeg);
        count = 0
        countVeg = 0
        message = ''
        messageVeg = ''
        idRecipes = [];
    }
}

async function send_to_two_topic_mqtt(topic1, topic2, data1, data2) {
    var options = {
        host: `mqtt://guest:guest@${IP}`,
        clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
        username: 'guest',
        password: 'guest',
    };
    var client = mqtt.connect(`mqtt://guest:guest@${IP}:1883`, options);
    client.on('connect', function () {
        client.publish(topic1, data1, function () {
            client.publish(topic2, data2, function () {
                client.end();
            });
        });
    });
}

exports.handler = function (context, event) {
    let _event = JSON.parse(JSON.stringify(event));
    const ingredient = String.fromCharCode(..._event.body.data);

    if (ingredient.length === 0) {
        context.callback(`Error, you have to insert one ingredient`)
    } else {
        getRecipesByIngredient(ingredient)
        context.callback(`Ingredient loaded: ${ingredient}`)
    }

};