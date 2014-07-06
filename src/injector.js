/**
 * Created by: Terrence C. Watson
 * Date: 7/3/14
 * Time: 8:44 PM
 */

    /*
    What does the injector need to do its work? It needs a function, and a map of module names to module functions.
     */
var _ = require("underscore");

function Injector(){
}


Injector.prototype.injectDependency = function(moduleFunction, value){
    return moduleFunction.bind(moduleFunction, value);
}


Injector.prototype.getModuleByName = function(name, modules){
    var moduleToReturn = null;

    modules.forEach(function(aModule){
        if(aModule.name === name) moduleToReturn = aModule;
    });

    if(!moduleToReturn) throw new Error("Module "+name+" does not exist or is not loaded.");
    return moduleToReturn;
};

Injector.prototype.moduleIsResolved = function(aModule){
    if(!aModule.resolved) return null;
    return true;
}



Injector.prototype.inject = function(moduleFunctionToBeInjected, modules){
    if(!moduleFunctionToBeInjected.dependencyNames) return moduleFunctionToBeInjected;

    moduleFunctionToBeInjected.dependencyNames.forEach(function(dependencyName){
       var dependencyModule = this.getModuleByName(dependencyName, modules);
    });
    var resolvedDependencies = [], resolvedDependency, moduleFunctionToReturn = moduleFunctionToBeInjected;
    var injectionFailed = false;
    moduleFunctionToBeInjected.dependencyNames.forEach(function(dependencyName){

       //get the module's dependencies
       var dependencyModule = this.getModuleByName(dependencyName, modules);

       if(this.moduleIsResolved(dependencyModule)){
           moduleFunctionToBeInjected = moduleFunctionToBeInjected.bind(moduleFunctionToBeInjected, dependencyModule.resolved);
       } else {
           injectionFailed = true;
       }
    }.bind(this));


    if(!injectionFailed) {
        //moduleFunctionToBeInjected = resolvedDependency;
        return moduleFunctionToBeInjected;
    } else {
        return null;
    }

};

module.exports = new Injector();