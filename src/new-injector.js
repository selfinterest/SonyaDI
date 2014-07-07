/**
 * Created by: Terrence C. Watson
 * Date: 7/6/14
 * Time: 5:35 PM
 */

var _ = require("underscore"), toposort = require("toposort");
/**
 * A new injector
 * @constructor
 */
function Injector(){
    this.moduleMap = {};
    this.instantiated = false;
}

Injector.prototype.registerModule = function(name, aModule){
    if(this.instantiated) throw new Error("No modules can be registered after injector is instantiated.");
    this.moduleMap[name] = aModule;
}

Injector.prototype.inject = function(aModule){
    if(aModule.resolved) return aModule.$get;
    var getFunction = aModule.$get;

    //if(aModule.resolved) return aModule.$get();

    aModule.$inject.forEach(function(dependencyName){
        getFunction = getFunction.bind(aModule, this.get(dependencyName));
    }.bind(this));

    aModule.resolved = true;

    return getFunction;
}

Injector.prototype.get = function(moduleName){
    this.instantiate();
    if(!this.moduleMap[moduleName]) throw new Error("Module "+moduleName+ " is not registered");
    var aModule = this.moduleMap[moduleName];

    if(aModule.$inject.length == 0) {
        aModule.resolved = true;
        return aModule.$get();
    }

    var dependencyNames = this.findAllModuleDependencies(aModule);

    dependencyNames.forEach(function(dependencyName){
        this.moduleMap[dependencyName].$get = this.inject(this.moduleMap[dependencyName]);
    }.bind(this));
    //var dependencies = {};

    //dependencyNames.forEach(function(dependencyName){
    //   dependencies[dependencyName] = this.get(dependencyName);
    //}.bind(this));

    aModule.$get = this.inject(aModule, dependencyNames);
    //if(aModule.resolved) return aModule.$get();

    //var dependencyNames = this.findAllModuleDependencies(moduleName);
    //this.resolveDependencies(dependencyNames);

    return aModule.$get();
}

Injector.prototype.instantiate = function(){
    if(!this.instantiated){
        this.resolutionOrder = this.getPreferredDependencyResolutionOrder();
        this.instantiated = true;
    }
}

Injector.prototype.findAllModuleDependencies = function(moduleName){
    return this.resolutionOrder.slice(0, this.resolutionOrder.indexOf(moduleName)) || [];
}


Injector.prototype.resolveDependencies = function(dependencyNames){
    var aModule;
    dependencyNames.forEach(function(dependencyName){
        aModule = this.moduleMap[dependencyName];
        if(!aModule.resolved) {
            this.resolveDependency(aModule);
        }
    }.bind(this));
}

Injector.prototype.resolveDependency = function(dependency){
    if(!dependency.$inject) {
        dependency.resolvedValue = dependency.$get();
    } else {
        var dependencies = dependency.$inject;
        this.resolveDependencies(dependencies);

    }

    dependency.resolved = true;
}



Injector.prototype.getPreferredDependencyResolutionOrder = function(){
    return toposort(this.findEdgesFromModules()).reverse();

}

Injector.prototype.findEdgesFromModules = function(){
    //First, get the module names
    var moduleNames = _.keys(this.moduleMap), dependencies, moduleEdges, allEdges = [];
    //Iterate over the module names
    moduleNames.forEach(function(moduleName){
        dependencies = this.moduleMap[moduleName].$inject || [];
        moduleEdges = this.getEdgesFromModule(moduleName, dependencies);
        if(moduleEdges){
            allEdges = allEdges.concat(moduleEdges);
        }
    }.bind(this));


    return allEdges;
}

Injector.prototype.getEdgesFromModule = function(moduleName, dependencies){
    var edges = [];

    dependencies.forEach(function(dependency){
        edges.push([moduleName, dependency ]);
    });

    return edges.length > 0 ? edges : null;
}
/**
 * @type {Injector}
 */
module.exports = new Injector();