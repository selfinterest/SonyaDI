/**
 * Created by: Terrence C. Watson
 * Date: 7/3/14
 * Time: 8:48 PM
 */

var Injector = require("./injector.js");

function DependencyResolver(){

}


DependencyResolver.prototype.resolve = function(modules){
    if(!modules) return Injector;

    modules.forEach(function(theModule){
        theModule.resolved = Injector.inject(theModule.module, modules);
    });

    return modules;
}

module.exports = new DependencyResolver();
