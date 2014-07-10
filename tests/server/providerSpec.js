/**
 * Created by: Terrence C. Watson
 * Date: 7/4/14
 * Time: 5:04 PM
 */


xdescribe("Provider", function(){
   var Provider;
   beforeEach(function(){
      Provider = require("../../src/provider.js");
   });

   it("should exist", function(){
       expect(Provider).toBeDefined();
   });

   it("should have provider types", function(){
       expect(Provider.types).toBeDefined();
   });

   it("should have a method for registering a provider", function(){
      var testModule = {
          name: "Test",
          moduleFunction: function(){
              return "test";
          }
      }
       var result = Provider.register(testModule);
       expect(result).toBe("test");     //because no type was specified, module is treated like a simple factory

       var serviceModule = {
           name: "Service",
           moduleFunction: function(){
               this.name = "Senea";
           },
           type: "service"
       }

       result = Provider.register(serviceModule);
       expect(result.name).toBe("Senea");


   });

   it("should have a method for getting a registered provider by name", function(){
       var serviceModule = {
           name: "Service",
           moduleFunction: function(){
               this.name = "Senea";
           },
           type: "service"
       }

       var anotherServiceModule = {
           name: "AnotherService",
           moduleFunction: function(){
               this.name = "Kacy";
           },
           type: "service"
       }

       Provider.register(serviceModule);
       var result = Provider.getByName("Service");
       expect(result.name).toBe("Senea");
       result = Provider.getByName("Service", anotherServiceModule);        //temporary substitution of one module by another
       expect(result.name).toBe("Kacy");
       result = Provider.getByName("Service");
       expect(result.name).toBe("Senea");
   });


    describe("ProviderTypes", function(){
        var aModule, bModule;
        beforeEach(function(){
            function moduleFunction(name){
                name = name || "Senea";
                this.name = name;
                return "Amala";
            }

            function moduleFunctionB(name){
                name = name || "Bowser";
                this.name = name;
                this.sound = "Bark!";
                return "Kacy";
            }

            aModule = {
                name: "Cat",
                moduleFunction: moduleFunction
            }

            bModule = {
                name: "Dog",
                moduleFunction: moduleFunctionB
            }
        });
        it("should have a factory type", function(){

            var providerFunction = Provider.types.factory(aModule);
            expect(providerFunction()).toBe("Amala");
            expect(providerFunction(bModule)).toBe("Kacy");
        });

        it("should have a service type", function(){
            var providerFunction = Provider.types.service(aModule);
            expect(providerFunction().name).toBe("Senea");
            expect(providerFunction(bModule).name).toBe("Bowser");
        });

        it("should have a class type", function(){
            var providerFunction = Provider.types.class(aModule);
            var Cat = providerFunction();
            var herbie = new Cat("Herbie");
            expect(herbie.name).toBe("Herbie");
            var Dog = providerFunction(bModule);
            var kacy = new Dog("Kacy");
            expect(kacy.sound).toBe("Bark!");
        });
    });



});

