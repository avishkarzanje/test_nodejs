// good blog for request-promise : https://blog.risingstack.com/node-hero-node-js-request-module-tutorial/

var express = require('express');

// for parsing middlewares which gives parsed body in while handling incoming requests.
var body_parser = require('body-parser');
var Multer = require('multer');
var multer = Multer();

// for calling REST API from node.js
var request = require('request-promise');

const PORT = 3000;
var app = express();
app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: true}));
app.use(multer.array());


app.all('/*', function (req, res, next) {
    // CORS headers
    res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

// Create our Express router
var router = express.Router();
// Add static middleware
app.use(express.static(__dirname + '/data'));


var log_fun = function(){
    console.log("Server is listening on port "+ PORT);
}

var get_url_handler = function(req, res, next)
{
    var my_json_var = ["Avishkar","Vijay", "Zanje"];
    res.json(my_json_var);
}

var test_handler = function(res, res)
{
    var my_json_var = [{"trait":"Confidence", "name":"Avishkar"},{"trait":"Persistent"}, {"trait":"Discipline"}];

    // calling a REST api from here
    const options = {
        url: 'http://localhost:3000/api/test',
        method: 'POST',
        json: {mes: 'heydude'}
    }

    request(options)
        .then( function(response){
            console.log("REST API call successful using Request-promise ",response);
            var json_obj = response;
            console.log(json_obj);
        })
        .catch(function(){
            console.log("API failure")
        });
    
    // another way of calling REST API
    request({
        url: 'http://localhost:3000/api/test',
        method: 'POST',
        json: {mes: 'heydude'}
      }, function(error, response, body){
          console.log("REST API call successful");
          var json_obj = body;
        console.log(json_obj.mes);
      });
    

    for(var i=0;i<my_json_var.length;i++)
    {
        var obj = my_json_var[i];
        for(key in obj)
        {
            console.log(" ",key," : ",obj[key]);
        }
    }
    res.json(my_json_var);
}

var test_post_handler = function(req, res)
{
    var post_req_body = req.body;
    console.log("Inside post ", req.body.comment);
    //console.log("Inside post handler "+JSON.parse(req));
    res.send(post_req_body);
}

var handle_tweets= function(response)
{
    console.log("--------- Tweets yay -------");
    console.log(response);
}

var handle_tweet_error = function(response)
{
    console.log("Twitter API failure ", response.message);
}

var get_tweets = function(req, res)
{
    var tweet_keyword = req.body.tweet_keyword;
    console.log("Tweet keyword is ", tweet_keyword);

    var options= {
        url:"https://api.twitter.com/1.1/search/tweets.json",
        method:"GET",
        qs:{
            q:tweet_keyword,
            result_type:"popular",
            count:10
        },
        headers:{
            authorization:"OAuth",
            oauth_consumer_key:"upRsu8Nn6XeFThts6hqrrKzQh",
            oauth_token:"947921261702909952-NjT7hIMAkS3zdRZ09Gb0rR11om5WxQb",
            oauth_version:"1.0"
        }
    }

    request(options).then(handle_tweets).catch(handle_tweet_error);
    res.send();
}

const userFieldSet = 'name, link, is_verified, picture,friends';
const pageFieldSet = 'name, id';

var fb_search = function (req, res)
{
    console.log(req.body);
    const  { queryTerm, searchType } = req.body;

    const options = {
      method: 'GET',
      uri: 'https://graph.facebook.com/v3.2/me',
      qs: {
        access_token: "EAAeok3xr8ZCMBADyAkiTmncJvO3QNHjAOUjZCsPTgCOoFxuZAD16mZCKwpaOJ7vTiq6QmWkxJrzOl6U61yFxf6D3UGIftgP7bES16BvXKPFsoCrUjTv3lqSW00k5QE5qkqam83AXZCLv53xemmmIUFUfqZBODxIZBoa5j0ws7Q4820FvtO05hf02uWtxdQMFDQKeZAKwM9KLjwZDZD",
        q: queryTerm,
        type: searchType,
        fields: searchType === 'page' ? pageFieldSet : userFieldSet
      }
    };

    request(options)
      .then(fbRes => {
// Search results are in the data property of the response.
// There is another property that allows for pagination of results.
// Pagination will not be covered in this post,
// so we only need the data property of the parsed response.
        const parsedRes = JSON.parse(fbRes); 
        console.log("return value is ",parsedRes);
        res.json(parsedRes);
      }).catch(function(response){
          console.log("error is calling fb api ",response.message)
      })
}

app.get("/get_url", get_url_handler);
router.route("/test").get(test_handler);
router.route("/test").post(test_post_handler);
router.route("/get_tweets").post(get_tweets);
router.route("/fb_search").post(fb_search);

// Register all our routes with /api
app.use('/api', router);
app.listen(PORT, log_fun);


// Sorting example taken from https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value
function dynamicSort(property) 
{
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

var People = [
    {Name: "Avishkar", Surname: "Zanje"},
    {Name:"Akshay", Surname:"Jr. Zanje"},
    {Name: "Vijay", Surname: "Sr Zanje"}
];

People.sort(dynamicSort("Name"));
console.log(People);
People.sort(dynamicSort("Surname"));
console.log(People);
People.sort(dynamicSort("-Surname"));
console.log(People);