# EmptyTheFridge

## Summary
[- Introduction](#introduction): brief introduction to the problem  
[- Architecture](#architecture): architecture of the idea  
[- Project structure](#project-structure): how the project is organized  
[- Getting started](#getting-started): guide to run the project  

## Introduction
This is a project for the exam of Serverless Computing for IoT.

How many times in the **fridge** do we have:
- some **ingredients** that we do not know how to use?
- some ingredients which are about to expire and must be consumed?

Not only is there the problem of **empty the fridge** for the options mentioned above, but also the problem of having **guests** at dinner and not knowing **what to cook** (especially in cases of intolerance and **vegetarianism** for example).

So the idea is to get **several recipes through one ingredient** to resolve the problems cited previously. In particular, will be received **5 recipes with the ingredient indicate**d. If some of these 5 recipes are vegetarian, then it will be send an **email indicates only the vegetarian recipes** (so we know faster what are the recipes suitable for eventual vegetarian guests).

All the recipes are obtained through **Spoonacular API** (https://spoonacular.com/food-api).

## Architecture
To send the ingredient and obtaining recipes there is the function ***'sendrecipes'*** on Nuclio.

The ingredient is sent in the **body of request**, after the function with a call API finds 5 recipes with that ingredient, and check if there are any vegetarian recipes.

And then all 5 recipes are published in the queue ***'iot/recipes'*** of **RabbitMQ**, while the vegetarian recipes are published in the queue ***'iot/alertVeg'*** always of **RabbitMQ**. 

When a message is published in the queue ***'iot/recipes'***, the function ***'getrecipes'*** on Nuclio is triggered. This function publishes the message with recipes in the queue ***'iot/ingredientLogger'***.

When a message is published in the ***'iot/alertVeg'*** queue, the function ***'alertvegetarian'*** on Nuclio is triggered, and send an email with the vegetarian recipes.

<p align="center">
<img src="images/architecture.jpg" alt="drawing"/>
</p>

## Project Structure
- yaml_functions/
  - _**sendrecipes.yaml**_: thanks to the ingredient passed in the body, takes care of sending the recipes and vegetarian recipes, to the queues **iot/recipes** and **iot/alertVeg** respectively
  - _**getrecipes.yaml**_: takes care of receiving recipes and sending them to the queue **iot/ingredientLogger**
  - _**alertvegetarian.yaml**_: takes care of receiving vegetarian recipes and sending them to an email address
- _**logger.js**_: takes care of printing the 5 recipes, with the ingredient, chosen that are obtained

## Getting Started
> EmptyTheFridge requires to run:
> -  [Node.js](https://nodejs.org/en/)
> -  [Docker](https://www.docker.com/products/docker-desktop)
> -  [Spoonacular API Account](https://spoonacular.com/food-api)
> -  [IFTT account](https://ifttt.com/)


From **different** terminals, start the docker to run RabbitMQ and Nuclio with these following commands:  
- **Docker RabbitMQ**:
  ```sh
  docker run -p 9000:15672  -p 1883:1883 -p 5672:5672  cyrilix/rabbitmq-mqtt
  ```
- **Docker Nuclio**:
  ```sh
  docker run -p 8070:8070 -v /var/run/docker.sock:/var/run/docker.sock -v /tmp:/tmp nuclio/dashboard:stable-amd64
  ```
  
- **Update and deploy Functions**:
  - In both functions, change **{YOUR_IP}** with your IP;
   - In ***'sendrecipes'*** change **{YOUR_API_KEY}** with your API key of your **Spoonacular account**;
  - In ***'alertvegerarian'*** change **{YOUR_API_KEY}** with your API key of your **IFTT account**;
  - Type '**localhost:8070**' on your browser to open the homepage of Nuclio;
  - Create new project and call it 'EmptyTheFridge';
  - Press '**Create function**', '**Import**' and upload the three functions that are in the **yaml_functions** folder;
  - Press **'Deploy'**.
- **Start Logger**: 
  open the terminal and type, from the **root of the project**:
  ```sh
  node logger.js
  ```
