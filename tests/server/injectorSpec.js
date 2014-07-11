/**
 * Created by: Terrence C. Watson
 * Date: 7/3/14
 * Time: 9:31 PM
 */


describe("New injector", function(){
    var Injector;

    beforeEach(function(){
        Injector = require("../../src/injector.js")
    });

    it("should exist", function(){
        expect(Injector).toBeDefined();
    });

    it("should have a map of modules", function(){
        expect(Injector.moduleMap).toBeDefined();
    });

    it("should have a way to register modules", function(){
       expect(Injector.registerModule).toBeDefined();
    });

    it("should be able to register a module", function(){
       Injector.registerModule("testModule", function(){});
        expect(Injector.moduleMap.testModule).toBeDefined();
    });

    it("should be able to get a preferred dependency resolution order", function(){
       function TestModuleFunction(){

       }

       function AnotherTestModuleFunction(){

       }

       AnotherTestModuleFunction.$inject = ["testModule"]
        Injector.registerModule("testModule", TestModuleFunction);
        Injector.registerModule("anotherTestModule", AnotherTestModuleFunction);
        var order = Injector.getPreferredDependencyResolutionOrder();
        expect(order.length).toBe(2);
        expect(order[0]).toBe("testModule");
        expect(order[1]).toBe("anotherTestModule");

       function FinalTestModuleFunction(){

       }

       FinalTestModuleFunction.$inject = ["testModule"];
       AnotherTestModuleFunction.$inject = ["testModule", "finalTestModule"];
        Injector.registerModule("finalTestModule", FinalTestModuleFunction);
        order = Injector.getPreferredDependencyResolutionOrder();
        expect(order.length).toBe(3);
        expect(order[0]).toBe("testModule");
        expect(order[1]).toBe("finalTestModule");
        expect(order[2]).toBe("anotherTestModule");
    });

    it("should have a method to resolve a module with no dependencies", function(){
        function TestModuleFunction(){
            return "test module";
        }

        TestModuleFunction.$inject = [];
        TestModuleFunction.$get = function(){
            return TestModuleFunction();
        }

        var result = Injector.resolve(TestModuleFunction, {});
        expect(result()).toBe("test module");
        expect(result()).toEqual(TestModuleFunction.$get());
        expect(TestModuleFunction._resolved).toEqual(TestModuleFunction.$get());
        expect(TestModuleFunction._resolved).toEqual(result());
        expect(TestModuleFunction._resolved).toEqual("test module");

    });

    it("should have a method to resolve a module with a single dependency", function(){
        function TestModuleFunction(){
            return "The first module";
        }

        TestModuleFunction.$inject = [];

        TestModuleFunction.$get = function(){
            return TestModuleFunction();
        }

        function AnotherTestModule(testModule){
            return testModule + " and the second module";
        }

        AnotherTestModule.$inject = ["TestModuleFunction"];

        AnotherTestModule.$get = function(){
            return AnotherTestModule.apply(AnotherTestModule, arguments);
        }

        var result = Injector.resolve(AnotherTestModule, {"TestModuleFunction": TestModuleFunction});
        expect(result()).toBe("The first module and the second module");
        expect(result()).toEqual(AnotherTestModule.$get());
        expect(result()).toEqual(AnotherTestModule._resolved);
        expect(AnotherTestModule._resolved).toEqual("The first module and the second module");
    });

    describe("Sophisticated DI tests", function(){
        var modules;
        Injector = require("../../src/injector.js")
        beforeEach(function(){
           modules = {};
            Injector.clearModules();
            function FirstModuleFunction(){
                return "The first module";
            }
            FirstModuleFunction.$inject = [];
            FirstModuleFunction.$get = function(){
                return FirstModuleFunction();
            }

            function SecondModuleFunction(firstModule){
                return firstModule + " and the second module";
            }

            SecondModuleFunction.$inject = ["FirstModuleFunction"];

            SecondModuleFunction.$get = function(){
                return SecondModuleFunction.apply(SecondModuleFunction, arguments);
            }

            function ThirdModuleFunction(firstModule, secondModule){
                return firstModule + " and " + secondModule + " and the third module";
            }


            ThirdModuleFunction.$inject = ["FirstModuleFunction", "SecondModuleFunction"];

            ThirdModuleFunction.$get = function(){
                return ThirdModuleFunction.apply(ThirdModuleFunction, arguments);
            }

            modules.firstModule = FirstModuleFunction;
            modules.secondModule = SecondModuleFunction;
            modules.thirdModule = ThirdModuleFunction;
        });


        it("should have a method to resolve a module with two dependencies", function(){
            /*function FirstModuleFunction(){
             return "The first module";
             }
             FirstModuleFunction.$inject = [];
             FirstModuleFunction.$get = function(){
             return FirstModuleFunction();
             }

             function SecondModuleFunction(firstModule){
             return firstModule + " and the second module";
             }

             SecondModuleFunction.$inject = ["FirstModuleFunction"];

             SecondModuleFunction.$get = function(){
             return SecondModuleFunction.apply(SecondModuleFunction, arguments);
             }

             function ThirdModuleFunction(firstModule, secondModule){
             return firstModule + " and " + secondModule + " and the third module";
             }


             ThirdModuleFunction.$inject = ["FirstModuleFunction", "SecondModuleFunction"];

             ThirdModuleFunction.$get = function(){
             return ThirdModuleFunction.apply(ThirdModuleFunction, arguments);
             }*/

            var result = Injector.resolve(modules.secondModule, {"FirstModuleFunction": modules.firstModule});
            expect(result()).toBe("The first module and the second module");
            result = Injector.resolve(modules.thirdModule, {"FirstModuleFunction": modules.firstModule, "SecondModuleFunction": modules.secondModule});
            var resultShouldBe = "The first module and The first module and the second module and the third module";
            expect(result()).toBe(resultShouldBe);
        });

        it("should have a method for getting a registered service or factory", function(){
            Injector
                .registerModule("FirstModuleFunction", modules.firstModule)
                .registerModule("SecondModuleFunction", modules.secondModule)
                .registerModule("ThirdModuleFunction", modules.thirdModule);

            var FirstModuleReturnValue = Injector.get("FirstModuleFunction");
            expect(FirstModuleReturnValue).toBe("The first module");
            var SecondModuleReturnValue = Injector.get("SecondModuleFunction");
            expect(SecondModuleReturnValue).toBe("The first module and the second module");
            var ThirdModuleReturnValue = Injector.get("ThirdModuleFunction");


        });
    })


    xit("should have a method to resolve a module with a single dependency, using a $get function", function(){
       function TestModuleFunction(){
            return "test module";
       }

       function AnotherTestModule(testModule){
            return "another test module "+testModule;
       }

        TestModuleFunction.$inject = [];

        AnotherTestModule.$inject = [TestModuleFunction];

        AnotherTestModule.$get = function(fn){
            console.log(fn);
            return fn;
        }

        TestModuleFunction.$get = function(){
            return TestModuleFunction();
        }

        var result = Injector.resolve(AnotherTestModule, [TestModuleFunction]);
        expect(result).toBe("another test module test module");
    });

    xit("should be able to resolve dependencies and instantiate services", function(){
        function TestModuleFunction(){
            return "test module return value";
        }

        function AnotherTestModuleFunction(testModule, finalTestModule){
            return testModule + " " + finalTestModule + " another test module return value";
        }

        function FinalTestModuleFunction(testModule){
            return testModule + " final test module return value";
        }

        FinalTestModuleFunction.$inject = ["testModule"];

        FinalTestModuleFunction.$get = function(testModule){
            return FinalTestModuleFunction(testModule);
        }

        AnotherTestModuleFunction.$get = function(testModule, finalTestModule){
            return AnotherTestModuleFunction(testModule, finalTestModule);
        }

        TestModuleFunction.$get = function(){
            return TestModuleFunction();
        }

        TestModuleFunction.$inject = [];

        AnotherTestModuleFunction.$inject = ["testModule", "finalTestModule"];

        Injector.registerModule("testModule", TestModuleFunction);
        Injector.registerModule("anotherTestModule", AnotherTestModuleFunction);
        Injector.registerModule("finalTestModule", FinalTestModuleFunction);

        var test = Injector.get("testModule");

        expect(test).toBe("test module return value");

        var anotherTest = Injector.get("anotherTestModule");
        expect(anotherTest).toBe("test module return value test module return value final test module return value another test module return value");

        var finalTest = Injector.get("finalTestModule");
        expect(finalTest).toBe("test module return value final test module return value");

    });

});