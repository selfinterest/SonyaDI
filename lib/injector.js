/**
 * Created by: Terrence C. Watson
 * Date: 7/6/14
 * Time: 5:35 PM
 */

var introspect = require("introspect"), SonyaModule = require("./lib/sonya-module.js"), Q = require("q");



/**
 * A new injector
 * @constructor
 */
function Injector(){
    if(this instanceof Injector){
        this.moduleMap = {};
        this.instantiated = false;
    } else {
        return new Injector();
    }

}

Injector.prototype.registerModule = function(name, aModule){
    //if(this.instantiated) throw new Error("No modules can be registered after injector is instantiated.");
    //aModule = this.annotate(aModule);
    this.moduleMap[name] = aModule;
    return this;
}

Injector.prototype.clearModules = function(){
    this.moduleMap = {};
    this.instantiated = false;
}


Injector.prototype.annotate = function(aFunctionOrArray){
    var fn, dependencies;
    if(typeof aFunctionOrArray == "function") {
        if(!aFunctionOrArray.$inject) {
            aFunctionOrArray.$inject = introspect(aFunctionOrArray);
        }
    } else if (Array.isArray(aFunctionOrArray)){
        fn = aFunctionOrArray[aFunctionOrArray.length - 1];
        dependencies = aFunctionOrArray.slice(0, aFunctionOrArray.length - 1);
        aFunctionOrArray = fn;
        aFunctionOrArray.$inject = Array.isArray(dependencies) ? dependencies : [dependencies];
    } else {
        //throw Error("Can only annotate a function or an array.");
    }

    return aFunctionOrArray;
}

/**
 * Invokes function fn, with self as "this", and applying localArgs if defined
 * @param fn
 * @param self
 * @param localArgs
 * @returns {*} The concrete value
 */
Injector.prototype.invoke = function(fn, self, localArgs){
    //this.instantiateInjector();

    self = self || fn;
    fn = this.annotate(fn);
    fn = this.inject(fn, localArgs);

    if(typeof fn !== "function") return fn;
    return fn.apply(self, fn.$inject)

};

Injector.convertDependenciesIntoPromises = function(dependencies){
    return dependencies.map(function(dependency){
       if(typeof dependency == "function"){
           return Q.when(dependency());
       } else {
           return Q.when(dependency);
       }
    });
};

Injector.prototype.invokeSync = function(fn, self, localArgs){
    self = self || fn;
    fn = this.annotate(fn);
    fn = this.inject(fn, localArgs);

    //Convert all dependencies into promises
    fn.$inject = Injector.convertDependenciesIntoPromises(fn.$inject);


    Q.all(fn.$inject).then(function(args){
       return fn.apply(self, args);
    });

};

Injector.prototype.bind = function(fn, self, localArgs){
    self = self || fn;
    fn = this.annotate(fn);
    //fn = this.inject(fn, localArgs, {ignoreMissing: true});
    return function(){
        fn = this.inject(fn, localArgs, {ignoreMissing: true});
        if(fn.$inject){
            var dependencies = fn.$inject;
            dependencies.forEach(function(dependency){
                if(typeof dependency != "undefined") fn = fn.bind(self, dependency);
            });
            fn.$inject = dependencies;
            return fn.apply(self, arguments);
        } else {
            return fn;
        }
    }.bind(this);


    //return fn;

};

Injector.prototype.bindSync = function(fn, self, localArgs){
    self = self || fn;
    fn = this.annotate(fn);

    return function(){
        var args = arguments;
        fn = this.inject(fn, localArgs, {ignoreMissing: true});
        if(fn.$inject){
            var dependencies = fn.$inject;
            var promises = [];
            dependencies.forEach(function(dependency){
                if(typeof dependency != "undefined"){
                    if(typeof dependency == "function"){
                        promises.push(Q.when(dependency()));
                    } else {
                        promises.push(Q.when(dependency));
                    }
                    //fn = fn.bind(self, dependency);
                }
            });
            fn.$inject = dependencies;
            Q.all(promises).then(function(resolvedDependencies){
                resolvedDependencies.forEach(function(dependency){
                   fn = fn.bind(self, dependency);
                });
                return fn.apply(self, args)
            });
            //return fn.apply(self, arguments);
        } else {
            return fn;
        }
    }.bind(this);
    /*fn = this.inject(fn, localArgs, {ignoreMissing: true});

    if(fn.$inject){
        var dependencies = fn.$inject;
        var promises = [];
        dependencies.forEach(function(dependency){
           if(typeof dependency != "undefined") {
               if(typeof dependency == "function") {
                   promises.push(Q.when(dependency()));
               } else {
                   promises.push(Q.when(dependency));
               }

           }
        });

        return function(){
            var args = arguments;
            Q.all(promises).then(function(resolvedDependencies){
                resolvedDependencies.forEach(function(dependency){
                   fn = fn.bind(self, dependency);
                });
                fn.apply(self, args);
            });

        };
    } else {
        return fn;
    }*/

};

/**
 *
 * @param {Function} aFunction
 * @param {Object} localArgs A map of args to be prepended to the function
 * @returns {Function}
 */
Injector.prototype.inject = function(aFunction, localArgs, options){

    localArgs = localArgs || {};
    options = options || {};

    if(!aFunction.$inject){
        aFunction = this.annotate(aFunction);
    }

    if(aFunction.$inject){
        aFunction.$inject.forEach(function(dependencyName, index){
            aFunction.$inject[index] = this.get(dependencyName) || localArgs[dependencyName];
            if(typeof aFunction.$inject[index] == "undefined") {        //notice: we don't check for null, because a module could validly resolve to null
                    aFunction.$inject[index] = Injector.requireModule(dependencyName);
                    if(typeof aFunction.$inject[index] == "undefined" && !options.ignoreMissing) throw new Error("Dependency "+dependencyName+ " is not registered");
            }
        }.bind(this));
    }

    return aFunction;

}

Injector.requireModule = function(moduleName){
    var theModule, changeCase = require("change-case");
    try {
        //first, try requiring the modue name as is...
        theModule = require(moduleName);
    } catch (e){
        //Okay, not found. So try to snake case the name
        try {
            moduleName = changeCase.param(moduleName);
            theModule = require(moduleName);
        } catch (e){

        }
    }

    return theModule;
}

/**
 * Instantiates a module, executing its $invoke function.
 * @param aModule
 * @param localArgs
 * @returns {*}
 */
Injector.prototype.instantiate = function(aModule, localArgs){
    localArgs = localArgs || {};
    aModule.$get = this.annotate(aModule.$get);
    aModule.$get = this.inject(aModule.$get, localArgs);

    if(aModule.$get.$inject){
        var dependencies = aModule.$get.$inject;
        dependencies.forEach(function(dependency){
            aModule.$get = aModule.$get.bind(aModule, dependency);
        }.bind(this));
    }

    return aModule.$invoke();


};

/**
 * Gets and instantiates a module by name, or returns the instantiated value if module is already instantiated
 * @param {string} moduleName
 * @returns {*} The instantiated module after resolving all dependencies
 */
Injector.prototype.get = function(moduleName){
    var aModule = this.moduleMap[moduleName];
    if(!aModule) return aModule;
    //if(!aModule) throw new Error("Module "+moduleName+" is not registered.");
    if(aModule._resolving) throw new Error("Circular dependency error!");

    aModule._resolving = true;
    if(!aModule._instantiated){
        aModule._instantiated = this.instantiate(aModule);
    }
    aModule._resolving = false;
    return aModule._instantiated;

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

/*Injector.prototype.instantiate = function(){
    if(!this.instantiated){
        this.resolutionOrder = this.getPreferredDependencyResolutionOrder();
        this.instantiated = true;
    }
}*/

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
};



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
module.exports = Injector;