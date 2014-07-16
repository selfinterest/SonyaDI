/**
 * Created by: Terrence C. Watson
 * Date: 7/6/14
 * Time: 5:42 PM
 */
xdescribe("Provide", function(){
    var Provide, ProvideClass, Injector = {
        registerModule: function(){
            console.log("REGISTERING REGISTERING")
        }
    }

    beforeEach(function(){
        ProvideClass = require("../../lib/lib/provide-class.js");
        Provide = new ProvideClass(Injector);

    });

    it("should have methods for factory, service, and class", function(){
       expect(Provide.factory).toBeDefined();
       expect(Provide.service).toBeDefined();
    });



    xit("should be able to provide factories and other things to the injector", function(){
        function testFunction(){

        }

        spyOn(Injector, "registerModule").andCallThrough();

        var service = Provide.service("testService", testFunction);

        expect(Injector.registerModule).toHaveBeenCalledWith("testService", testFunction);

        var factory = Provide.factory("testFactory", testFunction);
        expect(Injector.registerModule).toHaveBeenCalledWith("testFactory", testFunction);

        expect(testFunction.$get).toBeDefined();
        expect(typeof testFunction.$get).toBe("function");



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
        senea = seneaService.$get("cat");

        expect(senea.name).toBe("Senea");
        expect(SeneaService.resolved).toBe(true);

        function CatClass(name, sound){
            this.name = name;
            this.sound = sound;
        }

        CatClass = Provide.class("Cat", CatClass);
        var Cat = CatClass.$get();
        senea = new Cat("Senea", "meow");
        expect(senea.name).toBe("Senea");
        expect(senea.sound).toBe("meow");

        //Now try it with partial application
        Cat = CatClass.$get("Senea", "meow");
        senea = new Cat();
        expect(senea.name).toBe("Senea");
        expect(senea.sound).toBe("meow");

        //Now try it with a mixture
        Cat = CatClass.$get("Senea");
        senea = new Cat("meow");
        expect(senea.name).toBe("Senea");
        expect(senea.sound).toBe("meow");

    });

    describe("Tests with the real injector", function(){
        var modules = {}, RealInjector, services;
        beforeEach(function(){
            RealInjector = require("../../lib/injector.js");
            RealInjector.clearModules();
            Provide = new ProvideClass(RealInjector);
            //modules = {};
            //Injector.clearModules();

            function firstModule(){
                return "The first module";
            }

            //FirstModuleFunction.$inject = [];
            //FirstModuleFunction.$get = function(){
            //     return FirstModuleFunction();
            //}

            function secondModule(firstModule){
                return firstModule + " and the second module";
            }

            //SecondModuleFunction.$inject = ["FirstModuleFunction"];

            //SecondModuleFunction.$get = function(){
            //    return SecondModuleFunction.apply(SecondModuleFunction, arguments);
           // }

            function thirdModule(firstModule, secondModule){
                return firstModule + " and " + secondModule + " and the third module";
            }


            //ThirdModuleFunction.$inject = ["FirstModuleFunction", "SecondModuleFunction"];

            //ThirdModuleFunction.$get = function(){
            //    return ThirdModuleFunction.apply(ThirdModuleFunction, arguments);
            //}

            modules.firstModule = firstModule;
            modules.secondModule = secondModule;
            modules.thirdModule = thirdModule;

            services = {};
            services.firstService = function(){
                this.name = "Senea";
                this.type = "cat";
            }

            services.secondService = function(){
                this.name = "Kacy";
                this.type = "dog";
            }

            services.petSitting = function(firstService, secondService){
                this.firstPet = firstService;
                this.secondPet = secondService;
            }

        });

        it("should be able to register a factory with the injector, which can then be retrieved", function(){
           RealInjector.clearModules();
            function Factory(){
                return "Senea";
            }

            Provide.factory("Senea", Factory);

            delete RealInjector.moduleMap.Senea.$get;

            var senea = RealInjector.get("Senea");
            expect(senea).toEqual("Senea");

        });

        it("should be able to register a factory with the injector that has dependencies", function(){
           RealInjector.clearModules();
            function Factory(Amala){
               return Amala.name;
           }

           function Amala(){
               return {
                   name: "Amala"
               }
           }
           //var spy = spyOn(ProvideClass.prototype.types, "factory").andCallThrough();
           Provide.factory("Factory", Factory);
           Provide.factory("Amala", Amala);


           var factory = RealInjector.get("Factory");
           expect(factory).toBe("Amala");
        });

        xit("should be able to provide factories with dependencies", function(){

            Provide.factory("firstModule", modules.firstModule);
            Provide.factory("secondModule", modules.secondModule);
            Provide.factory("thirdModule", modules.thirdModule);

            expect(RealInjector.moduleMap.firstModule).toBeDefined();
            var firstModuleResult = RealInjector.get("firstModule");

            expect(firstModuleResult).toEqual("The first module");
            var secondModuleResult = RealInjector.get("secondModule");
            expect(secondModuleResult).toEqual("The first module and the second module");
            var thirdModuleResult = RealInjector.get("thirdModule");
            expect(thirdModuleResult).toEqual("The first module and The first module and the second module and the third module");
        });

        xit("should be able to provide more factories with dependencies", function(){
           modules.thirdModule = function(firstModule, secondModule, name){
               return firstModule + " and " + secondModule + " and the third module and my name is " + name;
           }

            Provide.factory("name", function(){
                return "Terrence";
            });
           Provide.factory("firstModule", modules.firstModule);

           Provide.factory("thirdModule", modules.thirdModule);
            Provide.factory("secondModule", modules.secondModule);

           var thirdModuleResult = RealInjector.get("thirdModule");
           expect(thirdModuleResult).toBe("The first module and The first module and the second module and the third module and my name is Terrence");


        });

        xit("should be able to provide services with no dependencies", function(){
            Provide.service("firstService", services.firstService);
            Provide.service("secondService", services.secondService);
            var firstResult = RealInjector.get("firstService");
            expect(firstResult.name).toBe("Senea");
            expect(firstResult.type).toBe("cat");
            var secondResult = RealInjector.get("secondService");
            expect(secondResult.name).toBe("Kacy");
            expect(secondResult.type).toBe("dog");
        });

        xit("should be able to provide services with dependencies", function(){
            Provide.service("petSitting", services.petSitting);
            Provide.service("firstService", services.firstService);
            Provide.service("secondService", services.secondService);
            var petSitting = RealInjector.get("petSitting");
            expect(petSitting.firstPet.name).toBe("Senea");
            expect(petSitting.secondPet.name).toBe("Kacy");
        });

        xit("should be able to provide a value", function(){
           Provide.value("version", 1);

           Provide.service("engine", function(version){
               console.log("Making service");
              if(version === 1){
                  this.power = 100;
              } else {
                  this.power = 50;
              }

           });

           var engine = RealInjector.get("engine");
           expect(engine.power).toEqual(100);

           Provide.value("version", 0);
           var engine = RealInjector.get("engine");
           expect(engine.power).toEqual(100); //this is the way dependency injection works
           //RealInjector.clearModules();

        });

        xit("should be able to provide a value", function(){
            Provide.value("version", 0);
            Provide.service("engine", function(version){
                console.log("making service");
                if(version === 1){
                    this.power = 100;
                } else {
                    this.power = 50;
                }

            });
            var engine = RealInjector.get("engine");
            expect(engine.power).toEqual(50);
        })


    });

    it("should be able to register modules with the injector", function(){
        Injector = require("../../lib/injector.js");
        Provide = new ProvideClass(Injector);
        Provide.service("bob", {});
        //console.log(Injector);
        expect(Injector.moduleMap.bob).toBeDefined();
    });

    xit("should be able to provide components with dependencies and have the dependency relationships resolved", function(){
       Injector = require("../../lib/injector.js");
       Injector.clearModules();

       Provide.service("engine", function(version){
          this.power = version === 1 ? 100 : 50;
          this.turnOn = function(){
              console.log("The engine is turned on, running at "+this.power);
          }
       });

       Provide.factory("version", function(){
           return 1;
       });

       Provide.service("car", function(engine){
          this.engine = engine;
          this.make = "Toyota";
          this.model = "corolla";
       });

       Provide.factory("vehicle", function(car){
          console.log(car);
          car.owner = "Terrence";
          car.engine.turnOn();
          return "This car is a " + car.make + " " + car.model + ". It belongs to "+car.owner;
       });


       console.log(Injector.moduleMap);
       expect(Injector.moduleMap["engine"]).toBeDefined();

       var vehicle = Injector.get("vehicle");
       console.log(vehicle);
    });
});