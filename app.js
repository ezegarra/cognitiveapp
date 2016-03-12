/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// handle post data
var bodyParser = require("body-parser");

// create application/json parser 
var jsonParser = bodyParser.json()

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url + ", port=" + appEnv.port);
});

console.log("process = " + JSON.stringify(process.env.VCAP_SERVICES));

// Environment variable definitions for accessing services depending on whether
// running locally or on Blueminx
if (process.env.VCAP_SERVICES) {
   var env = JSON.parse(process.env.VCAP_SERVICES);
   var personality_insights = env["personality_insights"][0].credentials;
} else {
   var personality_insights = {
           "username" : "ede47c22-3a1b-4fad-a7d3-8cf42976d99c",
           "password" : "SydzIp1cyk4m",
           "url" : "https://gateway.watsonplatform.net/personality-insights/api"
        }
};

// define raw request libraries
var request = require("request");

/**
* This is an approach for calling the service using raw http request calls
*/
app.post("/v1.0/personality-insights", jsonParser, function(req, res){
  var  text = req.body.data;

  var url = "https://" + personality_insights.username + ":" + personality_insights.password + "@gateway.watsonplatform.net/personality-insights/api";

  // call watson
  request({
      url     : url + "/v2/profile",
      method  : "POST",
      headers: {
          'content-type': 'text/plain'        
      },
      body    : text
    },
    function(error, response, body) {
      if ( error ) {
        console.log("error", error);
      }

      res.send(body);        
    });
});

/**
* This approach uses the new watson developer cloud api
*/
var watson = require("watson-developer-cloud");

var personality_insights2 = watson.personality_insights({
  username: personality_insights.username,
  password: personality_insights.password,
  version: "v2"
});

app.post("/v2.0/personality-insights", jsonParser, function(req, res){
  var  text = req.body.data;

  // call watson
  personality_insights2.profile({
      text: text},
      function(err, response) {
        if ( err ) {
          console.log("error", err);
        } 
        
        res.send(response);
      }
  );
});

/**
* This approach calls Node-Red
*/
app.post("/v3.0/personality-insights", jsonParser, function(req, res){
  var  text = req.body.data;

  var url = "http://127.0.0.1:1880/v3.0/personality-insights";

  // call watson
  request({
      url     : url,
      method  : "POST",
      headers: {
          'content-type': 'text/plain'        
      },
      body    : text
    },
    function(error, response, body) {
      if ( error ) {
        console.log("error", error);
      }

      res.send(body);        
    });
});