/**
 * Created by: Terrence C. Watson
 * Date: 7/6/14
 * Time: 5:49 PM
 */

var SonyaModule = require("./sonya-module.js");
var providers = require("./providers/default.js");
/**
 * Creates the provide service
 * @constructor
 */
function Provide(Injector){
    var self;
    if(this instanceof Provide) self = this;
    if(self) this.Injector = Injector;
    this.createProviderTypes(Injector);



}

Provide.prototype.createProviderTypes = function(Injector){
    var providerType;
    if(!Injector) Injector = this.Injector;
    function makeTypeFunction(providerType){
        return function(name, moduleFunction){
            var aModule;
            if(name && moduleFunction){
                aModule = this.types[providerType](moduleFunction);
            } else {
                aModule = this.types[providerType](name);
            }
            if(aModule instanceof SonyaModule){
                Injector.registerModule(name, aModule);
            }

            return this;
        }
    }

    for(var type in this.types){
        if(this.types.hasOwnProperty(type)){
            providerType = type;
            this[providerType] = makeTypeFunction.call(this, providerType);
        }

    }

}

if(!Provide.prototype.types){
    Provide.prototype.types = {};
}

//Set up default providers
for(var provider in providers){
    if(providers.hasOwnProperty(provider)){
        Provide.prototype.types[provider] = providers[provider];
    }
}

module.exports = Provide;