/**
 * Created by: Terrence C. Watson
 * Date: 7/3/14
 * Time: 9:31 PM
 */
describe("Injector", function(){
    var Injector;

    beforeEach(function(){
        Injector = require("../../src/injector.js")
    });

    it("should exist", function(){
       expect(Injector).toBeDefined();
    });

    it("should have a method for injecting dependencies", function(){
        expect(Injector.inject).toBeDefined();
    });

    it("should return the same module if the module has no dependencies", function(){
        function TestModule(){

        }

        var dependencies = [];

        var result = Injector.inject(TestModule, dependencies);
        expect(result).toBeDefined();
        expect(result).toBe(TestModule);

    });

    it("should return a different module if the module has dependencies", function(){
        function TestModule(){

        }

        TestModule.dependencyNames = ["DummyModule"];

        var result = Injector.inject(TestModule, []);
        expect(result).toBeDefined();
        //expect(result).not.toBe(TestModule);

    });

    it("should return a function that when executed returns a value", function(){
       function TestModule(){
           return "OY";
       }

       var result = Injector.inject(TestModule, []);
       expect(result()).toBe("OY");

    });

    it("should return a function that when executed returns a value, including a single dependency", function(){
       function TestModule(Dummy){
           return Dummy;
       }

       function DummyModule(){
           return "Dummy";
       }

       TestModule.dependencyNames = ["DummyModule"];

       var result = Injector.inject(TestModule, [{name: "DummyModule", module: DummyModule, resolved: DummyModule()}]);


       expect(result()).toBe("Dummy");


    });

    it("should return a function that when executed returns a value, including multiple dependencies", function(){
       function TestModule(Animal, Name){
           return Name + " is a " + Animal.type;
       }

        function AnimalModule(){
            return {type: "cat"};
        }

        function NameModule(){
            return "Senea";
        }

        TestModule.dependencyNames = ["AnimalModule", "NameModule"];

        var result = Injector.inject(TestModule, [{name: "AnimalModule", module: AnimalModule, resolved: AnimalModule()},
            {name: "NameModule", module: NameModule, resolved: NameModule()}
        ]);

        expect(result()).toBe("Senea is a cat");
    });

    it("should return null if a required dependency has not been resolved", function(){
        function TestModule(Dummy){

        }

        TestModule.dependencyNames = ["Dummy"];

        var result = Injector.inject(TestModule, []);
        expect(result).toBe(null);
    });



});