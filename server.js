var express = require("express");
var bodyparser = require("body-parser");
var path = require("path");
var mongo = require("mongodb");
var OAuth = require('oauth').OAuth;

var myDBClient = mongo.MongoClient;
var myDBUrl = process.env.mongodb_url;


var oauth = new OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
     process.env.twitter_consumer_key,
     process.env.twitter_consumer_secret,
    "1.0",
     process.env.twitter_callback_url,
    "HMAC-SHA1");

var app=express();

app.listen(process.env.PORT,process.env.IP);

app.use(express.static(path.resolve(__dirname, 'views')));
app.use(express.cookieParser(process.env.cookie_secret_key));
app.use(express.session());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));



app.set('view engine', 'ejs');

app.get("/",function(req,res){
  if (req.session.username) 
    res.render("index",{username:req.session.username});    
  else
    res.render("index");
});

app.get("/login",function(req,res){
  if (!req.session.username) {
        oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
            if (error) {
                console.log(error);
                res.send("Authentication Failed!");
            }
            else {
                req.session.oauth = {
                    token: oauth_token,
                    token_secret: oauth_token_secret
                };
                res.redirect('https://twitter.com/oauth/authenticate?oauth_token=' + oauth_token);
            }
        });
    }
    else {
        res.redirect('/');
    }
});

app.get('/login/callback', function(req, res, next) {

    if (req.session.oauth) {
        req.session.oauth.verifier = req.query.oauth_verifier;
        var oauth_data = req.session.oauth;

        oauth.getOAuthAccessToken(
            oauth_data.token,
            oauth_data.token_secret,
            oauth_data.verifier,
            function(error, oauth_access_token, oauth_access_token_secret, results) {
                if (error) {
                    console.log(error);
                    res.send("Authentication Failure!");
                }
                else {
                    req.session.oauth.access_token = oauth_access_token;
                    req.session.oauth.access_token_secret = oauth_access_token_secret;
                    req.session.username = results.screen_name;
                    res.send("Authentication Successful");
                    res.redirect('/');
                }
            }
        );
    }
    else {
        res.redirect('/');
    }
});

app.get("/logout", function(req, res) {
    req.session.destroy();
    res.redirect("/");
});


app.get("/retrieve", function(req, res) {
   
    myDBClient.connect(myDBUrl, function(err, db) {
        if (err) {
            console.log(err);
        }
        var mycoll = db.collection('carts');

              mycoll.find().toArray(function(err, result) {
                if(err) throw(err);
                else if(result.length){
                    res.json(result);
                }else
                    res.json();
                db.close();
            });
    });
});

app.post("/retrieveSp", function(req, res) {
   
    myDBClient.connect(myDBUrl, function(err, db) {
        if (err) {
            console.log(err);
        }
        var mycoll = db.collection('carts');

              mycoll.find({username:req.body.username}).toArray(function(err, result) {
                if(err) throw(err);
                else if(result.length){
                    res.json(result);
                }else
                    res.json();
                db.close();
            });
    });
});


app.post("/addNew",function(req,res){

    myDBClient.connect(myDBUrl, function(err, db) {
        if (err)
            console.log('Unable to connect to the mongoDB server. Error:', err);
        else {
            var myCol = db.collection('carts');

            myCol.insert({
                username: req.body.username,
                cartUrl: req.body.url,
                cartDesc: req.body.desc,
                votingUser: []
            }, function(error, response) {
                if (error)
                    console.log(error);
                res.json({"response":"oke"});
                db.close();
            });
        }
    });
});

app.post("/vote",function(req,res){

    myDBClient.connect(myDBUrl, function(err, db) {
        if (err)
            console.log('Unable to connect to the mongoDB server. Error:', err);
        else {
            var myCol = db.collection('carts');

    
            db.collection("carts").find({cartDesc:req.body.desc,votingUser:req.body.username}).toArray(function(e,d){
                if(e) throw(e);
                else if(d.length){
                     myCol.update({cartDesc:req.body.desc,votingUser:req.body.username},
                                { $pull: { votingUser: req.body.username}},function(error, response) {
                        if (error)
                            console.log(error);
                        res.json({"response":"pull"});
                        db.close();
                    }); 
                }else{
                         myCol.update({cartDesc:req.body.desc,votingUser:{$ne:req.body.username}},
                                    { $push: { votingUser:req.body.username}},function(error, response) {
                        if (error)
                            console.log(error);
                        res.json({"response":"push"});
                        db.close();
                    });
                }
            });
          }
    });
});

app.post("/delete",function(req,res){
    console.log(req.body);
    myDBClient.connect(myDBUrl, function(err, db) {
            if (err) {
                console.log(err);
            }
            db.collection('carts').remove({cartDesc:req.body.desc,username:req.body.username});
            res.json({"response":"deleted"});
            db.close();
    });
});