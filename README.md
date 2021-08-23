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
