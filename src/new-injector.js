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


    console.log("Getting: "+ moduleName);

    this.instantiate();

    var aModule = this.moduleMap[moduleName];
    this.resolve(aModule);


    console.log("module:");
    console.log(aModule);

    if(aModule.$inject.length == 0){
        var returnValue = aModule.$get();
        console.log("Return value: "+returnValue);
        return returnValue;
    }

    var dependencyNames = this.findAllModuleDependencies(aModule);

    aModule.$inject = _.union(aModule.$inject, dependencyNames);

    var dependencies = [];

    for(var i = 0; i < aModule.$inject.length && aModule.$inject.length > 0; i++){
        var dependencyName = aModule.$inject[i];
        console.log("Resolving "+dependencyName+" for "+moduleName);
        var dependency = this.get(dependencyName);
        console.log("Dependency is: ");
        console.log(dependency);
        dependencies.push(this.get(dependencyName));
        aModule.$inject = _.without(aModule.$inject, dependencyName);

        //dependencies[dependencyName] = this.get(dependencyName);
    }
    console.log("Resolved dependencies");
    console.log(dependencies);
    aModule.$get = aModule.$get.bind(aModule, dependencies);
    /*var dependencies = {};

    dependencyNames.forEach(function(dependencyName){
        dependencies[dependencyName] = this.get(dependencyName);
        //Remove the dependency from the list

        aModule.$inject = _.without(aModule.$inject, dependencyName);

    }.bind(this));*/

    //console.log("Dependency map: ");
    //console.log(dependencies);
    //aModule.$get = aModule.$get.bind(dependencies);
    return aModule.$get();

    /*if(aModule.resolved) {
        console.log("Module was already resolved. Returning: "+aModule.$get());
        return aModule.$get();
    }*/

    //console.log("Module was not already resolved. Resolving.");


    //if(aModule.$inject.length == 0) {

    //    aModule.resolved = true;
    //    console.log(moduleName + " had no dependencies. Returning "+aModule.$get());
    //    return this.get(moduleName);
    //}


    /*var dependencyNames = this.findAllModuleDependencies(aModule);

    console.log("Module had dependencies. They are: ");
    console.log(dependencyNames);

    dependencyNames.forEach(function(dependencyName){
        console.log("Attempting to resolve "+dependencyName +" for "+moduleName);
        var dependency = this.moduleMap[dependencyName];
        if(!dependency.resolved) {
            console.log("Resolving "+dependencyName+ " for "+moduleName);
            this.moduleMap[dependencyName].$get = this.inject(this.moduleMap[dependencyName]);
        } else {
            console.log(dependencyName + " was already resolved");
        }

    }.bind(this));

    console.log("Injecting "+moduleName);
    aModule.$get = this.inject(aModule, dependencyNames);
    return aModule.$get();*/
}

/**
 *
 * @param {Function} aModule A module function with $get and $inject properties.
 * @param {Object} dependencyMap A map of dependency names to module functions
 * @returns A function, that when executed with no parameters, returns the value
 */
Injector.prototype.resolve = function(aModule, dependencyMap){
    var i, resolved = [];

    if(aModule.$inject.length < 1) {
        aModule._resolved = aModule.$get();

    } else {
        var dependency = dependencyMap[aModule.$inject[0]];
        dependency.$get = this.resolve(dependency, dependencyMap);



        //RESOLVE DEPENDENCY
        dependency._resolved = dependency.$get();
        aModule.$get = aModule.$get.bind(aModule, dependency._resolved);
        aModule._resolved = aModule.$get();


    }

    return aModule.$get;
    //By this point, aModule should have $get and $inject properties



/*    if(aModule.$get){
        if(aModule.$inject.length > 0){
            for(i = 0; i < aModule.$inject.length; i++){
                resolved.push(this.resolve(dependencies[i]));
                aModule.$get = aModule.$get.bind.apply(aModule, resolved);
            }

            return aModule.$get();
        } else {
            return aModule.$get();
        }
    } else {
        if(aModule.$inject.length > 0){
            for(i = 0; i < aModule.$inject.length; i++){
                resolved.push(this.resolve(dependencies[i]));
                //aModule.$get = aModule.$get.bind(aModule, resolved);
            }
            return aModule.apply(aModule, resolved);
        } else {
            return aModule();
        }

    }*/

}

Injector.prototype.instantiate = function(){
    if(!this.instantiated){
        this.resolutionOrder = this.getPreferredDependencyResolutionOrder();
        this.instantiated = true;
    }
}

Injector.prototype.findAllModuleDependencies = function(moduleName){
    console.log(this.resolutionOrder);
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