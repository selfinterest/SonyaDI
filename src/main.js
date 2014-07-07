/**
 * Created by: Terrence C. Watson
 * Date: 6/29/14
 * Time: 10:58 PM
 */

var Loader = require("./loader.js");
var Provider = require("./provider.js");

function AngularLoader(options){
    Loader
        .loadModule("ExpressModule", require("./expressModule.js"))
        .loadModule("AngularModule", require("./angularModule.js"))
        .loadModule("dummyModule", function(){
            return "I am a dummy module. I do nothing."
        })
        .initialize();

    var v = Provider.getByName("AngularModule");
    console.log(v);

    return v;
}

module.exports = AngularLoader;