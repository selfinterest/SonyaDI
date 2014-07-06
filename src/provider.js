/**
 * Created by: Terrence C. Watson
 * Date: 7/4/14
 * Time: 5:01 PM
 */

function Provider(){
    this.providerMap = {};
}

Provider.prototype.types = {};

Provider.prototype.types.factory = function(theResolvedModule){
    return function(resolvedModule){
        resolvedModule = resolvedModule || theResolvedModule;
        return resolvedModule.moduleFunction();
    }
}

Provider.prototype.types.service = function(theResolvedModule){
    return function(resolvedModule){
        resolvedModule = resolvedModule || theResolvedModule;  //closures ftw!
        return new resolvedModule.moduleFunction();
    }
}

Provider.prototype.types.class = function(theResolvedModule){
    return function(resolvedModule){
        resolvedModule = resolvedModule || theResolvedModule;
        return resolvedModule.moduleFunction;
    }
}

Provider.prototype.getTypeFunction = function(type){
    if(this.types[type]) return this.types[type];
    throw new Error("Provider type "+type+" is not found.");
}


Provider.prototype.register = function(theResolvedModule){
    if(!theResolvedModule.type) {
        this.providerMap[theResolvedModule.name] = this.types.factory(theResolvedModule);
    } else {
        this.providerMap[theResolvedModule.name] = this.getTypeFunction(theResolvedModule.type)(theResolvedModule);
    }

    return this.providerMap[theResolvedModule.name]();
}


Provider.prototype.getByName = function(providerName, optionalModule){
    return this.providerMap[providerName] ? this.providerMap[providerName](optionalModule) : null;
}
module.exports = new Provider();