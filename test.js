var providerClass = require("./lib/lib/provide-class.js");
var path = require("path");


providerClass.prototype.types.fromDirectory = function(dir){
    console.log(path.resolve(dir));
};



var sonya = require("./lib/main.js");
sonya.Provide.fromDirectory("./");