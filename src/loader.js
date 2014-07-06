/**
 * Created by: Terrence C. Watson
 * Date: 6/30/14
 * Time: 4:09 PM
 */

"use strict";

var dependencyResolver;

if(module && exports){
    dependencyResolver = require("./dependencyResolver.js");
}

(function(exports){
    var modules = [], self = {};

    exports.loadModule = function(moduleName, moduleFunction){
        modules.push({name: moduleName, moduleFunction: moduleFunction});
        return this;
    };

    function resolveDependencies(modules, options){
        if(dependencyResolver){
            return dependencyResolver.resolve(modules);
        } else {
            throw new Error("No suitable method found for resolving dependencies.");
        }


    }

    exports.initialize =  function(options){
        return resolveDependencies(self.modules, options);
    }

})(typeof exports === 'undefined'? this['loader']={}: exports);



