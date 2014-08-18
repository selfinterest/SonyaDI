/**
 * Created by twatson on 8/9/14.
 */

//Asynchronous versions of the default providers
var SonyaModule = require("../sonya-module.js");

exports.asyncService = function(moduleFunction){
    var aModule = SonyaModule(moduleFunction);
    aModule.$type = "asyncService";

    //This MUST return a promise
    aModule.$invoke = function(){

    }
};
