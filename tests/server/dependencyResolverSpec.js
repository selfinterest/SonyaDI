/**
 * Created by: Terrence C. Watson
 * Date: 7/3/14
 * Time: 9:19 PM
 */
describe("Dependency resolver", function(){
   var dependencyResolver, Injector;
   beforeEach(function(){
       dependencyResolver = require("../../src/dependencyResolver");
   });

   it("should have a method for resolving dependencies", function(){
      expect(typeof dependencyResolver.resolve).toBe("function");
   });

    it("if given no modules at all, should return an injector", function(){
        var result = dependencyResolver.resolve();
        expect(result).toBeDefined();

    });

    it("if given a single module without dependencies, should simply instantiate the module and return it", function(){
       function someModuleFunction(){
           return "dummy";
       }

       var someModule = {name: "dummy", module: someModuleFunction};
       var result = dependencyResolver.resolve([someModule]);
       expect(result[0].resolved()).toBe("dummy");
   })

    it("if given two modules, one depending on the other, should resolve the dependencies", function(){
       var animalModule = {
           name: "Animal",
           module: function(){
               return {type: "cat"}
           }
       }

       var catModule = {
           name: "Cat",
           module: function(Animal){
               return "Senea is a "+Animal().type
           }
       }

       catModule.module.dependencyNames = ["Animal"];

       var result = dependencyResolver.resolve([animalModule, catModule]);
       expect(result[1].resolved()).toBe("Senea is a cat");
    });
});