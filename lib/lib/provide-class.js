/**
 * Created by: Terrence C. Watson
 * Date: 7/6/14
 * Time: 5:49 PM
 */

var SonyaModule = require("./sonya-module.js");
var providers = require("./providers/default.js");
/**
 * Creates the provide service
 * @constructor
 */
function Provide(Injector){
    var self;
    if(this instanceof Provide) self = this;

    this.createProviderTypes(Injector);



}

Provide.prototype.createProviderTypes = function(Injector){
    var providerType;

    function makeTypeFunction(providerType){
        return function(name, moduleFunction){
            var aModule;
            if(name && moduleFunction){
                aModule = this.types[providerType](moduleFunction);
            } else {
                aModule = this.types[providerType](name);
            }
            if(aModule instanceof SonyaModule){
                Injector.registerModule(name, aModule);
            }

            return this;
        }
    }

    for(var type in this.types){
        if(this.types.hasOwnProperty(type)){
            providerType = type;
            this[providerType] = makeTypeFunction.call(this, providerType);
        }

    }

}

if(!Provide.prototype.types){
    Provide.prototype.types = {};
}


for(var provider in providers){
    if(providers.hasOwnProperty(provider)){
        Provide.prototype.types[provider] = providers[provider];
    }
}

/*Provide.prototype.types.factory = providers.factory;
Provide.prototype.types.service = providers.service;
Provide.prototype.types.value = providers.value;
Provide.prototype.types.provider = providers.provider;*/

/*Provide.prototype.types.factory = function(moduleFunction){
        var aModule = SonyaModule(moduleFunction);
        aModule.$type = "factory";

        aModule.$invoke = function(){
            return this.$get(arguments);
        }

        return aModule;
}*/

/*Provide.prototype.types.service = function(moduleFunction){
    var aModule = SonyaModule(moduleFunction);
    aModule.$type = "service";

    aModule.$invoke = function(){
        return new this.$get(arguments);
    }

    return aModule;

}*/

/*Provide.prototype.types.value = function(moduleFunction){
    var aModule = SonyaModule(moduleFunction);
    aModule.$type = "value";
    aModule.$invoke = function(){
        return this.$get;
    }
    return aModule;
}*/

/*Provide.prototype.types.provider = function(moduleFunction){
    var providedFunction = new moduleFunction();

    var aModule = SonyaModule(providedFunction);


    aModule.$invoke = function(){
        if(typeof this.$get != "function") console.log(this);
        return this.$get(arguments);
    }

    return aModule;
}*/


module.exports = Provide;