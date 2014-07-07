/**
 * Created by: Terrence C. Watson
 * Date: 7/6/14
 * Time: 5:49 PM
 */

var introspect = require("introspect");
var mixin = require("utils-merge");
var _ = require("underscore");
/**
 * Creates the provide service
 * @constructor
 */
function Provide(Injector){



    function makeAFunction(type, allTypes){
        return function (name, moduleFunction){
            var $inject = getInjectArrayFromModuleFunction(moduleFunction);
            if(!Array.isArray($inject)){
                moduleFunction = $inject.moduleFunction;
                moduleFunction.$inject = $inject.$inject;
            } else {
                moduleFunction.$inject = $inject;
            }

            moduleFunction.$get = function(){
                moduleFunction.resolved = true;
                return allTypes[type](moduleFunction, arguments);
            }

            Injector.register(name, moduleFunction);

            return moduleFunction;
        }
    }

    function getInjectArrayFromModuleFunction(moduleFunction){
        if(moduleFunction.$inject && typeof moduleFunction == "function") return moduleFunction.$inject;       //$inject trumps
        if(typeof moduleFunction == "function") return inferInjectArrayFromModuleFunctionParameters(moduleFunction);
        if(Array.isArray(moduleFunction)) {
            return getInjectArrayFromAnnotatedArray(moduleFunction);
        }
        return [];
        //throw new Error("Could not get $inject array from this module function");
    };


    function inferInjectArrayFromModuleFunctionParameters (moduleFunction) {
        return introspect(moduleFunction);
    };

    function getInjectArrayFromAnnotatedArray (array){
        var lastItem = array[array.length - 1];
        if(typeof lastItem !== "function") throw new Error("Annotated array is malformed.");
        return {
            moduleFunction: lastItem,
            $inject: array.slice(0, array.length - 1)
        };
    }

    for(type in this.types){
        this[type] = makeAFunction(type, this.types);
    }


}

Provide.prototype.types = {};

Provide.prototype.types.factory = function(moduleFunction, args){
        return moduleFunction.apply(moduleFunction, args);
}

Provide.prototype.types.service = function(moduleFunction, args){

    return new moduleFunction(args);


}

Provide.prototype.types.class = function(moduleFunction, args){

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
}

module.exports = Provide;