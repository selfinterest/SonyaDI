/**
 * Created by: Terrence C. Watson
 * Date: 7/6/14
 * Time: 5:42 PM
 */
describe("Provide", function(){
    var Provide, ProvideClass, Injector = {
        register: function(){

        }
    }

    beforeEach(function(){
        ProvideClass = require("../../src/lib/provide-class.js");
        Provide = new ProvideClass(Injector);

    });

    it("should have methods for factory, service, and class", function(){
       expect(Provide.factory).toBeDefined();
       expect(Provide.service).toBeDefined();
    });

    xit("should have methods for inferring $inject array from function declaration", function(){
       function DogCatName (dog, cat, name){

       }
       var result = Provide.inferInjectArrayFromModuleFunctionParameters(DogCatName);
       expect(result[0]).toBe("dog");
       expect(result.length).toBe(3);
    });

    xit("should have methods for getting the inject array from an angular-style annotated array", function(){
        var array = [
        "dog",
        "cat",
        "name",
        function(dog, cat, name){

        }
        ];

        var result = Provide.getInjectArrayFromAnnotatedArray(array);
        expect(result.$inject).toBeDefined();
        expect(result.$inject.length).toBe(3);
        expect(result.moduleFunction).toBeDefined();
        expect(typeof result.moduleFunction).toBe("function");
    });

    xit("should have a method for getting the inject array from any valid module configuration", function(){
        var array = [
            "dog",
            "cat",
            "name",
            function(dog, cat, name){

            }
        ];

        function DogCatName (dog, cat, name){

        }

        function InjectedFunction(){

        }

        InjectedFunction.$inject = ["dog", "cat"];

        var result;



        /*result = Provide.getInjectArrayFromModuleFunction(InjectedFunction);
        expect(result.length).toBe(2);

        result = Provide.getInjectArrayFromModuleFunction(DogCatName);
        expect(result.length).toBe(3);

        result = Provide.getInjectArrayFromModuleFunction(array);
        expect(result.$inject.length).toBe(3);*/

    });

    it("should be able to provide factories and other things to the injector", function(){
        function testFunction(){

        }

        spyOn(Injector, "register").andCallThrough();

        var service = Provide.service("testService", testFunction);
        expect(Injector.register).toHaveBeenCalledWith("testService", testFunction);

        var factory = Provide.factory("testFactory", testFunction);
        expect(Injector.register).toHaveBeenCalledWith("testFactory", testFunction);

        expect(service.$get).toBeDefined();
        expect(service.$inject).toBeDefined();
        expect(typeof service.$get).toBe("function");
        expect(service.$inject.length).toBe(0);

        function AnimalFactory(animalName, animalType){
            return {
                name: animalName,
                type: animalType
            }
        }

        var animalFactory = Provide.factory("AnimalFactory", AnimalFactory);
        expect(AnimalFactory.resolved).toBeUndefined();
        var senea = animalFactory.$get("Senea", "cat");
        expect(AnimalFactory.resolved).toBe(true);
        //console.log(senea);
        expect(senea.type).toBe("cat");
        expect(senea.name).toBe("Senea");

        /*var animalFactory = Provide.factory("AnimalFactory", AnimalFactory);
        console.log(animalFactory.$get());
        console.log(animalFactory.$get("Senea", "cat"));

        expect(animalFactory("Senea", "cat").name).toBe("Senea");
        expect(animalFactory("Kacy", "dog").type).toBe("dog");
        */

        function SeneaService(animalType){

            this.name = "Senea";
            this.type = animalType;
        }

        var seneaService = Provide.service("Senea", SeneaService);
        var senea = seneaService.$get("cat");

        expect(senea.name).toBe("Senea");
        expect(SeneaService.resolved).toBe(true);

        //var seneaService = Provide.service("SeneaService", SeneaService);
        //var senea2 = seneaService.$get();
        //console.log(senea2);
        //senea = seneaService.$get()("cat");
        //console.log(senea);
        //expect(senea.type).toBe("cat");
        //console.log(senea);

    })
});