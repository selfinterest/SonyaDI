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
    var self;
    if(this instanceof Provide) self = this;


    /*function makeGetFunction(type, allTypes){

        return function (name, moduleFunction){
            //var $inject = getInjectArrayFromModuleFunction(moduleFunction);
            /*if(!Array.isArray($inject)){
                moduleFunction = $inject.moduleFunction;
                moduleFunction.$inject = $inject.$inject;
            } else {
                moduleFunction.$inject = $inject;
            }*/

     //       if(typeof(moduleFunction == "function")){
      //          moduleFunction.$get = this.types[type];
      //      } else { //execute the $getter immediately
      //          moduleFunction = this.types[type](moduleFunction);
       //     }


            //moduleFunction.$type = type;

    //        Injector.registerModule(name, moduleFunction);

    //        return moduleFunction;
    //    }.bind(self);
   // }

    function getInjectArrayFromModuleFunction(moduleFunction){
        if(moduleFunction.$inject && typeof moduleFunction == "function") return moduleFunction.$inject;       //$inject trumps
        if(typeof moduleFunction == "function") return inferInjectArrayFromModuleFunctionParameters(moduleFunction);
        if(Array.isArray(moduleFunction)) {
            return getInjectArrayFromAnnotatedArray(moduleFunction);
        }
        return []; //return an empty array for no dependencies
        //throw new Error("Could not get $inject array from this module function");
    }


    function inferInjectArrayFromModuleFunctionParameters (moduleFunction) {
        return introspect(moduleFunction);
    }

    function getInjectArrayFromAnnotatedArray (array){
        var lastItem = array[array.length - 1];
        if(typeof lastItem !== "function") throw new Error("Annotated array is malformed.");
        return {
            moduleFunction: lastItem,
            $inject: array.slice(0, array.length - 1)
        };
    }


    for(var type in this.types){
        this[type] = function(name, moduleFunction){
            if(moduleFunction == "function"){
                moduleFunction.$get = this.types[type];
            } else {
                moduleFunction.$get = this.types[type](moduleFunction);
            }
            Injector.registerModule(name, moduleFunction);
            return this;
        }
    }


}

Provide.prototype.types = {};

Provide.prototype.types.factory = function(moduleFunction, args){

        return moduleFunction();
       // return moduleFunction.apply(moduleFunction, args);
        //return moduleFunction.apply(moduleFunction, args);
}

Provide.prototype.types.service = function(moduleFunction, args){
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
    return new moduleFunction();

}

Provide.prototype.types.value = function(moduleFunction){
    return moduleFunction; //we don't execute it. Just return it. Value can have no dependencies.
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