/**
 * Created by: Terrence C. Watson
 * Date: 7/17/14
 * Time: 12:52 AM
 */

var SonyaModule = require("../sonya-module.js");

exports.factory = function(moduleFunction){
    var aModule = SonyaModule(moduleFunction);
    aModule.$type = "factory";

    aModule.$invoke = function(){
        return this.$get(arguments);
    };

    return aModule;
};

exports.service = function(moduleFunction){
    var aModule = SonyaModule(moduleFunction);
    aModule.$type = "service";

    aModule.$invoke = function(){
        return new this.$get(arguments);
    }

    return aModule;
}

exports.value = function(value){
    var aModule = SonyaModule(value);
    aModule.$type = "value";
    aModule.$invoke = function(){
        return this.$get;
    };
    return aModule;
}

exports.provider = function(moduleFunction){
    var providedFunction = new moduleFunction();

    var aModule = SonyaModule(providedFunction);


    aModule.$invoke = function(){
        return this.$get(arguments);
    }

    return aModule;
}
