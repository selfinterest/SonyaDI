/**
 * Created by: Terrence C. Watson
 * Date: 7/6/14
 * Time: 5:49 PM
 */

var introspect = require("introspect");
var mixin = require("utils-merge");
var _ = require("underscore");
var SonyaModule = require("./sonya-module.js");
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
            var aModule = this.types[providerType](moduleFunction);
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

Provide.prototype.types = {};

Provide.prototype.types.factory = function(moduleFunction){
        var aModule = SonyaModule(moduleFunction);
        aModule.$type = "factory";

        aModule.$invoke = function(){
            return this.$get(arguments);
        }

        return aModule;
}

Provide.prototype.types.service = function(moduleFunction){
    var aModule = SonyaModule(moduleFunction);
    aModule.$type = "service";

    aModule.$invoke = function(){
        return new this.$get(arguments);
    }
    /*function create(constructor, args){
        var object = Object.create(constructor.prototype);
        var result = constructor.apply(object, args);
        if(typeof result === "object") {
            return result;
        } else {
            return object;
        }
    }
    return create(moduleFunction, args);
    //var constructor = moduleFunction.bind.apply(moduleFunction, args);
    //return new constructor;
*/
    return aModule;

}

Provide.prototype.types.value = function(moduleFunction){
    var aModule = SonyaModule(moduleFunction);
    aModule.$type = "value";
    aModule.$invoke = function(){
        return this.$get;
    }
    return aModule;
}

Provide.prototype.types.provider = function(moduleFunction){
    var providedFunction = new moduleFunction();

    var aModule = SonyaModule(providedFunction);


    aModule.$invoke = function(){
        if(typeof this.$get != "function") console.log(this);
        return this.$get(arguments);
    }

    return aModule;
}
/*Provide.prototype.types.class = function(moduleFunction, args){

    function create(constructor, moreArgs){
        moreArgs = _.values(moreArgs);
        args = _.values(args);
        var allArguments = args.concat(moreArgs);
        var object = Object.create(constructor.prototype);
        var result = constructor.apply(object, allArguments);

        if(typeof result === "object"){
            return result;
        } else {
            return object;
        }
    }

    return function(){
        return create(moduleFunction, arguments);

    }
    //return create.bind(moduleFunction, args moduleFunction(args), args);
}*/

module.exports = Provide;