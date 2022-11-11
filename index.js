
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const AWS = require('aws-sdk');
// const jsonData = require('./database.json')

const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json({ strict: false }));

const INGREDIENTS_TABLE = process.env.INGREDIENTS_TABLE || 'ingredients-dev';
const params = {
    TableName: INGREDIENTS_TABLE,
}; 


app.get('/', function (req, res) {
  res.send('Hello World!')
});

app.get('/health', function (req, res) {
  res.send('Health Check!!')
});

app.get('/ingredient/:ingredient', function(req,res) {
    const newParams = {
        ...params,
        Key: {
            ingredient: req.params.ingredient
        }
    };
    dynamoDb.get(newParams, (err, resp) => {
        err ? res.status(400).json(err) : res.status(200).json(resp);
    })
});

// take in array of objects with ingred structure
app.post('/add-ingredients', function(req, res) {
    // data = array of ingredients  
    const {data} = req.body;
    console.log(req.body.data, ' DATA');
    // stringify the "tags", 
    // add name to property
    // early return if data is not an array
    if(!Array.isArray(data)) return res.status(400).json({err: "data must be an array"});
    const errs = [];
    data.map((ingredient, i) => {
        let newParams = {
            ...params,
            Item: {
                ingredient: ingredient.name,
                test: ingredient.text,
                tags: JSON.stringify(ingredient.tags)
            }
        };

        console.log(newParams, ' NEW PARAMS');

        dynamoDb.put(newParams, (err) => {
            err ? errs.push(`Error happened at index ${i} : err: ${err}`) : null;
        });
    })
    
    res.json({message: "successfully added data", errors: errs});
});

// TODO: bulk import (database.json file above)
app.post('/add-all-ingredients', function(req, res) {
    // data = array of ingredients  
    // const {data} = req.body;
    // data will be an array of ingredient objects
    
    // res.json(jsonData);
});

// when testing locally either run below or run app in serverless local mode
// app.listen(3000);

module.exports.handler = serverless(app);