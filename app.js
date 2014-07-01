/**
 * Created by: Terrence C. Watson
 * Date: 6/29/14
 * Time: 10:53 PM
 */

var express = require("express")
  , http = require("http")
  , angularLoader = require("./src/main.js");

var app = express();

app.use("/angular", angularLoader());
app.use('/public', express.static(__dirname + '/public'));
app.use('/tests', express.static(__dirname + "/tests/client"));


app.get("/", function(req, res){
    res.sendfile("./index.html");
});



http.createServer(app).listen(4000);

