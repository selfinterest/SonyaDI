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

    it("should have a method for getting edges from a single module", function(){
        function someModuleFunction(){

        }

        someModuleFunction.dependencyNames = ["someOtherModule"];

        var result = dependencyResolver.getEdgesFromModule({name: "someModule", moduleFunction: someModuleFunction});

        expect(result).toEqual([["someModule", "someOtherModule"]]);

        result = dependencyResolver.getEdgesFromModule({name: "aModuleWithNoDependencies", moduleFunction: function(){}});
        expect(result).toBe(null);

        someModuleFunction.dependencyNames = ["someOtherModule", "anotherModule", "anotherOne"];
        result = dependencyResolver.getEdgesFromModule({name: "someModule", moduleFunction: someModuleFunction});
        expect(result.length).toBe(3);
        expect(result[1]).toEqual(["someModule", "anotherModule"]);
    });

    it("should have a method of getting edges from an array of modules, for a topological sort", function(){
        function someModuleFunction(){

        }

        function someOtherModuleFunction(){

        }
        someOtherModuleFunction.dependencyNames = ["someModule"];

        function anotherModuleFunction(){

        }
        anotherModuleFunction.dependencyNames = ["someOtherModule"];

        var result = dependencyResolver.findEdgesFromModules([
            {"name": "someModule", "moduleFunction": someModuleFunction},
            {"name": "someOtherModule", "moduleFunction": someOtherModuleFunction},
            {"name": "anotherModule", "moduleFunction": anotherModuleFunction}
        ]);

        expect(result).toEqual([["someOtherModule", "someModule"], ["anotherModule", "someOtherModule"]]);

        anotherModuleFunction.dependencyNames = ["someModule", "someOtherModule"];  //make it depend on both.

        result = dependencyResolver.findEdgesFromModules([
            {"name": "someModule", "moduleFunction": someModuleFunction},
            {"name": "someOtherModule", "moduleFunction": someOtherModuleFunction},
            {"name": "anotherModule", "moduleFunction": anotherModuleFunction}
        ]);

        expect(result.length).toBe(3);
    });

    it("should have a method that takes the modules array and returns the preferred order of dependency resolution", function(){
        function someModuleFunction(){

        }

        function someOtherModuleFunction(){

        }
        someOtherModuleFunction.dependencyNames = ["someModule"];

        function anotherModuleFunction(){

        }

        anotherModuleFunction.dependencyNames = ["someModule", "someOtherModule"];  //make it depend on both.

        var result = dependencyResolver.getBestDependencyResolutionOrder([
            {"name": "someModule", "moduleFunction": someModuleFunction},
            {"name": "someOtherModule", "moduleFunction": someOtherModuleFunction},
            {"name": "anotherModule", "moduleFunction": anotherModuleFunction}
        ]);

        expect(result).toEqual(["someModule", "someOtherModule", "anotherModule"]);
    });

    it("should have a method for resolving a module's dependencies", function(){
        var animalModule = {
            name: "Animal",
            moduleFunction: function(){
                return {type: "cat"}
            }
        }

        var catModule = {
            name: "Cat",
            moduleFunction: function(Animal){
                return "Senea is a "+Animal.type
            }
        }

        catModule.moduleFunction.dependencyNames = ["Animal"];

        var result = dependencyResolver.resolveModule(animalModule, [animalModule, catModule]);
        expect(result.resolvedValue).toEqual({type: "cat"});

        result = dependencyResolver.resolveModule(catModule, [animalModule, catModule]);
        expect(result.resolvedValue).toEqual("Senea is a cat");
    });

    it("should have a method for resolving all the dependencies in an array of modules", function(){
       var modules = [];
       modules[0] = {
           name: "Vehicle",
           moduleFunction: function(engine){
               return {make: "Toyota", model: "Corolla", engine: engine}
           }
       }
       modules[0].moduleFunction.dependencyNames = ["Engine"];
       modules[1] = {
           name: "Engine",
           moduleFunction: function(version){
               var engine = {};
               if(version == 1){
                   engine.power = 100;
               } else {
                   engine.power = 50;
               }
               return engine;
           }
       }

       modules[1].moduleFunction.dependencyNames = ["Version"];

       modules[2] = {
           name: "MyCar",
           moduleFunction: function(vehicle){
               return "Terrence's car is: "+vehicle.make + " " + vehicle.model + " with " + vehicle.engine.power + "HP";
           }
       }

       modules[2].moduleFunction.dependencyNames = ["Vehicle"];

       modules[3] = {
           name: "Version",
           moduleFunction: function(){
               return 1;
           }
       }



       var result = dependencyResolver.resolve(modules);
       expect(result[2].resolvedValue).toContain("Toyota Corolla");
       expect(result[3].resolvedValue).toEqual(1);


    });


});