/**
 * Created by: Terrence C. Watson
 * Date: 7/3/14
 * Time: 8:44 PM
 */

var _ = require("underscore");

function Injector(){
}

Injector.prototype.getResolvedModuleByName = function(name, resolvedModules){
    var resolvedModuleToReturn = null;

    resolvedModules.forEach(function(resolvedModule){

        if(resolvedModule.name === name && resolvedModule.resolved) resolvedModuleToReturn = resolvedModule.resolved;
    });
    return resolvedModuleToReturn;
};



Injector.prototype.inject = function(moduleFunctionToBeInjected, modules){
    if(!moduleFunctionToBeInjected.dependencyNames) return moduleFunctionToBeInjected;

    var resolvedDependencies = [], resolvedDependency, moduleFunctionToReturn = moduleFunctionToBeInjected;
    var injectionFailed = false;
    moduleFunctionToBeInjected.dependencyNames.forEach(function(dependencyName){

       //get the module
       resolvedDependency = this.getResolvedModuleByName(dependencyName, modules);
       if(resolvedDependency) {
           moduleFunctionToBeInjected = moduleFunctionToBeInjected.bind(moduleFunctionToBeInjected, resolvedDependency);
           //resolvedDependencies.push(resolvedDependency.resolved);
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