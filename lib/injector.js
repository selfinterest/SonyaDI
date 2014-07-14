/**
 * Created by: Terrence C. Watson
 * Date: 7/6/14
 * Time: 5:35 PM
 */

var _ = require("underscore"), toposort = require("toposort"), introspect = require("introspect");
/**
 * A new injector
 * @constructor
 */
function Injector(){
    this.moduleMap = {};
    this.instantiated = false;
}

//get, invoke, instantiate, annotate



Injector.prototype.registerModule = function(name, aModule){
    //if(this.instantiated) throw new Error("No modules can be registered after injector is instantiated.");

    this.moduleMap[name] = aModule;
    return this;
}

Injector.prototype.clearModules = function(){
    this.moduleMap = {};
    this.instantiated = false;
}

Injector.prototype.invoke = function(fn, args){
    this.instantiate();
    if(typeof fn !== "function") return fn;
    if(!fn.$get) return fn(args);

    return fn.$get(fn, args);
}

Injector.prototype.inject = function(aFunction, args){
    this.instantiate();
    if(aFunction._resolved) return aFunction._resolved;
    if(aFunction._isBeingResolved) throw new Error("Circular dependency!");
    aFunction._isBeingResolved = true;

    args = args || [];
    if(!_.isArray(args)) args = [args];


    var dependencies = [];

    aFunction = this.getDependencies(aFunction);


    //if(typeof aFunction !== "function") return aFunction;
    if(aFunction.$inject){
        aFunction.$inject.forEach(function(dependencyName){
            if(!this.moduleMap[dependencyName]) throw new Error("Dependency "+dependencyName + " is not registered.");
            var dependency = this.moduleMap[dependencyName];
            var injectedDependency = this.inject(dependency);
            if(dependency.$get) injectedDependency.$get = dependency.$get;
            dependencies.push(injectedDependency);

        }.bind(this));
    }

    dependencies.forEach(function(dependency){
        //Turn the dependency into a concrete value
        var concreteValue = this.invoke(dependency, args);
        dependency._resolved = concreteValue;
        aFunction = aFunction.bind(aFunction, concreteValue);
    }.bind(this));

    if(aFunction._isBeingResolved) aFunction._isBeingResolved = false;

    return aFunction;



}

Injector.prototype.getDependencies = function(aFunction){
    if(_.isArray(aFunction)){
        var lastItem = aFunction[aFunction.length - 1];
        if(typeof lastItem !== "function") throw new Error("Annotated array is malformed.");
        var dependencies = aFunction.slice(0, aFunction.length - 1);
        aFunction = lastItem;
        aFunction.$inject = dependencies;
    } else if(typeof aFunction === "function") {
        if(!aFunction.$inject) {
            aFunction.$inject = introspect(aFunction);
        }
    } else {
        //throw new Error("Only a function can be injected.");
    }

    return aFunction;
}

Injector.prototype.get = function(moduleName){

    if(!this.moduleMap[moduleName]) throw new Error("Module "+moduleName+ " is not registered");




    this.instantiate();


    var aModule = this.moduleMap[moduleName];

    //If module is already resolved...
    if(aModule._resolved) return aModule._resolved;

    var dependencyMap = {};
    var moduleDependencies = this.findAllModuleDependencies(moduleName);
    moduleDependencies = aModule.$inject;

    if(moduleDependencies){
        moduleDependencies.forEach(function(dependencyName){
            dependencyMap[dependencyName] = this.moduleMap[dependencyName];
        }.bind(this));
    } else {
        dependencyMap = {};
    }



    aModule.$get = this.resolve(aModule, dependencyMap);

    return aModule._resolved || aModule;


}

/**
 *
 * @param {Function} aModule A module function with $get and $inject properties.
 * @param {Object} dependencyMap A map of dependency names to module functions
 * @returns A function, that when executed with no parameters, returns the value
 */
Injector.prototype.resolve = function(aModule, dependencyMap){
    var i, resolved = [];

    if(typeof aModule !== "function") //aModule is a value
    {
        return aModule;
    }

    if(aModule._resolved) return aModule.$get;

    aModule.$inject.forEach(function(dependencyName){
        //var dependency = this.moduleMap[dependencyName];
        var dependency = dependencyMap[dependencyName] || this.moduleMap[dependencyName];
        if(typeof dependency === "undefined") throw new Error("Dependency "+dependencyName + " was not registered");
        if(typeof dependency === "function"){
            if(!dependency._resolved){
                dependency.$get = this.resolve(dependency, dependencyMap);
                //dependency._resolved = dependency.$get();

            }

            aModule.$get = aModule.$get.bind(aModule, dependency._resolved);
        } else {
            aModule.$get = aModule.$get.bind(aModule, dependency);
        }

    }.bind(this));

    if(!aModule._resolved) {
        aModule._resolved = aModule.$get();
    }

    return aModule.$get;


}

Injector.prototype.instantiate = function(){
    if(!this.instantiated){
        this.resolutionOrder = this.getPreferredDependencyResolutionOrder();
        this.instantiated = true;
    }
}

Injector.prototype.findAllModuleDependencies = function(moduleName){
    //if(moduleName.$inject.length < 1) return [];
    //console.log(this.resolutionOrder);
    var moduleIndex = this.resolutionOrder.indexOf(moduleName);
    return this.resolutionOrder.slice(0, moduleIndex - 1);
    //return _.union(this.resolutionOrder, moduleName.$inject) || [];
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