/**
 * Created by: Terrence C. Watson
 * Date: 6/29/14
 * Time: 10:58 PM
 */

var Loader = require("./loader.js");

function AngularLoader(options){
    Loader
        .load("expressModule", require("./expressModule.js"))
        .load("dummyModule", function(){
            return "I am a dummy module. I do nothing."
        });
    return Loader.initialize(options);

}

module.exports = AngularLoader;