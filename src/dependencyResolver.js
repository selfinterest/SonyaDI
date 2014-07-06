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
           aModule.moduleFunction = Injector.injectDependency(aModule.moduleFunction, dependencyModule.resolvedValue);
        }.bind(this));
    }

    aModule.resolvedValue = aModule.moduleFunction();

    return aModule;
}

DependencyResolver.prototype.resolveModulesWithNoDependencies = function(modules){
    var modulesWithNoDependencies = this.getModulesWithNoDependencies(modules);
    if(!modulesWithNoDependencies) return;

    modulesWithNoDependencies.forEach(function(aModule){
        this.markModuleAsResolving(aModule);
        aModule.resolvedFunction = aModule.moduleFunction;
        this.markModuleAsResolved(aModule);
    }.bind(this));

    //return this.getUnresolvedModules(modules);

    //return _.difference(modules, modulesWithNoDependencies)
}

DependencyResolver.prototype.markModuleAsResolving = function(module){
    module._resolving = true;
    module._resolved = false;
}

DependencyResolver.prototype.markModuleAsResolved = function(module){
    module._resolving = false;
    module._resolved = true;
}

DependencyResolver.prototype.getUnresolvedModules = function(modules){

    return _.filter(modules, function(aModule){
        return !aModule.resolvedFunction;
    });

}

DependencyResolver.prototype.getModulesWithNoDependencies = function(modules){
    var modulesToReturn = [];


    modules.forEach(function(aModule){
        if(!this.moduleHasDependency(aModule)){
            modulesToReturn.push(aModule);
        }
    }.bind(this));

    if(modulesToReturn.length > 0) {
        return modulesToReturn;
    } else {
        return null;
    }
}

DependencyResolver.prototype.moduleIsResolving = function(aModule){
    return aModule._resolving;
}

DependencyResolver.prototype.moduleHasDependency = function(aModule){
    if(!aModule.moduleFunction.dependencyNames) return false;
    return aModule.moduleFunction.dependencyNames.length != 0;

}
DependencyResolver.prototype.resolveModulesWithResolvedDependencies = function(modules){

}



DependencyResolver.prototype.moduleHasResolvedDependencies = function(aModule){

}

