/**
 * Created by: Terrence C. Watson
 * Date: 6/29/14
 * Time: 10:53 PM
 */

var express = require("express")
  , http = require("http")
    , dependencyResolver = require("./src/dependencyResolver.js")
    , Provider = require("./src/provider.js")
  , angularLoader = require("./src/main.js");




var app = express();

var angularRouteFunction = function(router){
    router.get("/", function(req, res){
        res.send("Angular route loaded.");
    });

    return router;
}

angularRouteFunction.dependencyNames = ["router"];

dependencyResolver.resolve([
    {name: "router", moduleFunction: require("./src/expressModule")},
    {name: "angularRoute", moduleFunction: angularRouteFunction},
    {name: "dummyModule", moduleFunction: function(){ return "dummy"}}
]);


app.use("/angular");
app.use('/public', express.static(__dirname + '/public'));
app.use('/tests', express.static(__dirname + "/tests/client"));


app.get("/", function(req, res){
    res.sendfile("./index.html");
});



http.createServer(app).listen(4000);

