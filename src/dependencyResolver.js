/**
 * Created by: Terrence C. Watson
 * Date: 7/3/14
 * Time: 8:48 PM
 */

var Injector = require("./injector.js");
var _ = require("underscore");
var toposort = require("toposort");

module.exports = new DependencyResolver();


function DependencyResolver(){

}


DependencyResolver.prototype.resolve = function(modules){
    var moduleDependencyResolutionOrder, aModule;
    try {
        moduleDependencyResolutionOrder = this.getBestDependencyResolutionOrder(modules);
        moduleDependencyResolutionOrder.forEach(function(moduleName){
            aModule = this.getModuleByName(modules, moduleName);
            this.resolveModule(aModule, modules);
        }.bind(this));
    } catch (e){
        //rethrow for now
        throw(e);
    }

    return modules;
}


DependencyResolver.prototype.getBestDependencyResolutionOrder = function(modules){
    return toposort(this.findEdgesFromModules(modules)).reverse();
}

DependencyResolver.prototype.findEdgesFromModules = function(modules){
    var allEdges = [], moduleEdges;

    modules.forEach(function(aModule){
       moduleEdges = this.getEdgesFromModule(aModule);
       if(moduleEdges){
           allEdges = allEdges.concat(moduleEdges);
       }
    }.bind(this));

    return allEdges;
}

DependencyResolver.prototype.getEdgesFromModule = function(aModule){
    var edges = [], edge;
    if(this.moduleHasDependency(aModule)){
        aModule.moduleFunction.dependencyNames.forEach(function(dependencyName){
            edges.push([aModule.name, dependencyName]);
        });
    }

    return edges.length > 0 ? edges : null;

}

DependencyResolver.prototype.getModuleByName = function(modules, moduleName){
    return _.findWhere(modules, {name: moduleName});
}

DependencyResolver.prototype.resolveModule = function(aModule, modules){
    if(this.moduleHasDependency(aModule)){
        aModule.moduleFunction.dependencyNames.forEach(function(dependencyName){
           var dependencyModule = this.getModuleByName(modules, dependencyName);

           if(!dependencyModule) throw new Error("Dependency module "+dependencyName + " is not defined!");
           if(!dependencyModule.resolvedValue) throw new Error("Dependency resolution error for "+dependencyModule);

           aModule.moduleFunction = Injector.injectDependency(aModule.moduleFunction, dependencyModule.resolvedValue);
        }.bind(this));
    }

    aModule.resolvedValue = this.registerResolvedModuleWithProvider(aModule);

    return aModule;
}



DependencyResolver.prototype.moduleHasDependency = function(aModule){
    if(!aModule.moduleFunction.dependencyNames) return false;
    return aModule.moduleFunction.dependencyNames.length != 0;

}

DependencyResolver.prototype.registerResolvedModuleWithProvider = function(aModule){

    if(!aModule.type) return aModule.moduleFunction();

    return aModule.moduleFunction();
}