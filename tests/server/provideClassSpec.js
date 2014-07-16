/**
 * Created by: Terrence C. Watson
 * Date: 7/15/14
 * Time: 7:57 PM
 */
describe("provide class", function(){
   var ProvideClass = require("../../lib/lib/provide-class.js");
   var SonyaModule = require("../../lib/lib/sonya-module.js");
   var mockInjector;

   beforeEach(function(){
    mockInjector = {
        moduleMap: {},
        registerModule: function(name, aModule){
            this.moduleMap[name] = aModule;
        }
    }
   });
   it("should exist", function(){
      expect(ProvideClass).toBeDefined();
   });
   it("should have types inherited by constructed objects", function(){
       expect(ProvideClass.prototype.types).toBeDefined();
   });
   it("should be able to use its types to create modules", function(){
      var moduleName = "test";
      var moduleFunction = function(){

      };
      var createdModule = ProvideClass.prototype.types.factory(moduleName, moduleFunction);
      //expect(createdModule.name).toBe("test");
      expect(createdModule.$get).toBeDefined();
      expect(createdModule.$type).toBe("factory");
      expect(createdModule instanceof SonyaModule).toBe(true);
   });
   describe("provide object", function(){
       var provide;
       beforeEach(function(){
          provide = new ProvideClass(mockInjector);
       });

       it("should have types inherited from constructor", function(){
           expect(provide.factory).toBeDefined();
           expect(provide.service).toBeDefined();
           expect(provide.value).toBeDefined();
           expect(typeof provide.factory).toBe("function");
           expect(typeof provide.service).toBe("function");
           expect(typeof provide.value).toBe("function");


       });

       it("should be able to use types to create modules of the same type", function(){
          var spy = spyOn(mockInjector, "registerModule").andCallThrough();
          var result = provide.factory("test", function(){});
          expect(result).toBe(provide);
          expect(mockInjector.moduleMap.test).toBeDefined();
          expect(mockInjector.moduleMap.test instanceof SonyaModule).toBe(true);
          expect(mockInjector.moduleMap.test.$get).toBeDefined();
          expect(mockInjector.moduleMap.test.$invoke).toBeDefined();
          expect(mockInjector.moduleMap.test.$type).toBe("factory");
          expect(spy).toHaveBeenCalled();

       });

       describe("Its specific providers", function(){
           var TestFactory, TestService, TestValue, TestProvider;
           beforeEach(function(){
                TestFactory = function(){
                    return "Amala";
                }
                TestService = function(){
                    this.name = "Senea";
                }
                TestValue = "Heather";

                TestProvider = function(){
                    this.name = "Terrence";
                    this.$get = function(){
                        return "Terrence's name is " + this.name;
                    }
                }
           });

           it("should be able to create a factory with an invoke function, that when called, emits a value", function(){
               provide.factory("testFactory", TestFactory);
               var factory = mockInjector.moduleMap.testFactory;
               var result = factory.$invoke();
               expect(result).toBe("Amala");
           });

           it("should be able to create a service with an invoke function that, when called, emits a value", function(){
              provide.service("testService", TestService);
              var service = mockInjector.moduleMap.testService;
              var result = service.$invoke();
              expect(result.name).toBe("Senea");
           });

           it("should be able to create a test value with an invoke function that, when called, emits a value", function(){
              provide.value("testValue", TestValue);
              var value = mockInjector.moduleMap.testValue;
              var result = value.$invoke();
              expect(result).toBe("Heather");
           });

           it("should be able to create a provider with an invoke function that, when called, emits a value", function(){
              provide.provider("testProvider", TestProvider);
              var provider = mockInjector.moduleMap.testProvider;

              var result = provider.$invoke();
              expect(result).toBe("Terrence's name is Terrence");
           });
       })
   })
});