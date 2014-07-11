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
    //if(this.instantiated) throw new Error("No modules can be registered after injector is instantiated.");

    this.moduleMap[name] = aModule;
    return this;
}

Injector.prototype.clearModules = function(){
    this.moduleMap = {};
    this.instantiated = false;
}

Injector.prototype.inject = function(aModule){
    if(aModule.resolved) return aModule.$get;
    if(aModule.$inject.length == 0) return aModule.$get;

    //var getFunction = aModule.$get;
    /*var dependencies = [];
    //if(aModule.resolved) return aModule.$get();

    aModule.$inject.forEach(function(dependencyName){

        dependencies.push(this.get(dependencyName));
        //var dependency = this.get(dependencyName);
        //console.log(dependency);
        //getFunction = getFunction.bind.apply(aModule, this.get(dependencyName));
    }.bind(this));
    console.log("DEPENDENCIES: ");
    console.log(dependencies);
    //if(dependencies.length > 1) process.exit();
    //getFunction = getFunction.bind.apply(aModule, dependencies);
    aModule.$get = aModule.$get.bind.apply(aModule, dependencies);
    aModule.resolved = true;*/
    var dependencies = [];
    aModule.$inject.forEach(function(dependencyName){
       var dependency = this.get(dependencyName);

       dependencies.push(this.get(dependencyName));
       //aModule.$get = aModule.$get.bind(dependency);
    }.bind(this));
    console.log("Dependencies retrieved:")
    console.log(dependencies);
    aModule.$get = aModule.$get.bind.apply(aModule, dependencies);
    aModule.resolved = true;
    return aModule.$get;
    //return getFunction;
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
                dependency._resolved = dependency.$get();

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