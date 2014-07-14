/**
 * Created by: Terrence C. Watson
 * Date: 7/3/14
 * Time: 9:31 PM
 */


describe("New injector", function(){
    var Injector;

    beforeEach(function(){
        Injector = require("../../lib/injector.js")
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

    describe("inject method", function(){

        it("should be able to inject a function with a single dependency, a value", function(){
            function TestFunction(name){
                return name;
            }
            Injector.moduleMap.name = "Senea";
            var newFunction = Injector.inject(TestFunction);
            var result = newFunction();
            expect(result).toBe("Senea");
        });

        it("should, given a function with no dependencies, simply return that function", function(){
            function TestFunction(){
                return "Senea";
            }

            var newFunction = Injector.inject(TestFunction);
            var result = newFunction();
            expect(result).toBe("Senea");
        });

        it("should be able to inject a function with two dependencies, one being another function", function(){
            function TestFunction(saySomething, name){
                return name + " says " + saySomething;
            }

            Injector.moduleMap.name = "Senea";
            Injector.moduleMap.saySomething = function(){
                return "Meow!"
            }

            var newFunction = Injector.inject(TestFunction);
            var result = newFunction();
            expect(result).toBe("Senea says Meow!");
        });

        it("should be able to inject a function with a dependency that itself has dependencies", function(){
            function TestFunction(saySomething){
                return saySomething;
            }

            Injector.moduleMap.saySomething = function(name){
                return name + " says meow!";
            }
            Injector.moduleMap.name = "Senea";

            var newFunction = Injector.inject(TestFunction);
            var result = newFunction();
            expect(result).toBe("Senea says meow!");
        });

        it("should be able to inject a function that has no dependencies at all", function(){
            function TestFunction(){
                return "Senea";
            }
            var newFunction = Injector.inject(TestFunction);
            var result = newFunction();
            expect(result).toBe("Senea");
        });

        it("should be able to work with a function that has a $get constructor", function(){
            function TestFunction(name){
                this.name = name;
            }

            TestFunction.$get = function(fn){
                return new fn();
            }

            function FinalFunction(Test, name){
                return name +"'s name is "+Test.name;
            }

            Injector.moduleMap.name = "Senea";
            Injector.moduleMap.Test = TestFunction;


            var newFunction = Injector.inject(FinalFunction);
            var result = newFunction();
            expect(result).toBe("Senea's name is Senea");

        });
    });


    describe("invoke method", function(){
        it("invoke a function constructor", function(){
            function TestFunction(name){
                this.name = name;
            }

            TestFunction.$get = function(fn){
                return new fn();
            }

            var boundTestFunction = TestFunction.bind(TestFunction, "Senea");

            boundTestFunction.$get = TestFunction.$get;

            var senea = Injector.invoke(boundTestFunction);
            expect(senea.name).toBe("Senea");
        });

        it("should be able to invoke constructor functions when multiple, nested dependencies are involved", function(){
            function serviceConstructor(serviceFn){
                return new serviceFn();
            }
            function ServiceOne(){
                //this.number = "one";
                //return "one";
                this.number = "one";
            }

            function ServiceTwo(One){
                this.number = One.number + " and two";
            }

            function ServiceThree(Two){
                this.number = Two.number + " and three";
            }

            function ServiceFour(Three){
                this.number = Three.number + " and four";
            }

            ServiceOne.$get = serviceConstructor;
            ServiceTwo.$get = serviceConstructor;
            ServiceThree.$get = serviceConstructor;
            ServiceFour.$get = serviceConstructor;

            var serviceOneInstance = Injector.invoke(ServiceOne);
            Injector.moduleMap.One =  ServiceOne;
            var serviceTwoInstance = Injector.invoke(Injector.inject(ServiceTwo));
            Injector.moduleMap.Two = ServiceTwo;
            var serviceThreeInstance = Injector.invoke(Injector.inject(ServiceThree));
            Injector.moduleMap.Three = ServiceThree;
            var serviceFourInstance = Injector.invoke(Injector.inject(ServiceFour));


            expect(serviceOneInstance.number).toEqual("one");
            expect(serviceTwoInstance.number).toEqual("one and two");
            expect(serviceThreeInstance.number).toEqual("one and two and three");
            expect(serviceFourInstance.number).toEqual("one and two and three and four");
            Injector.clearModules();
            var spy1 = spyOn(ServiceOne, "$get").andCallThrough();
            var spy2 = spyOn(ServiceTwo, "$get").andCallThrough();
            var spy3 = spyOn(ServiceThree, "$get").andCallThrough();
            var spy4 = spyOn(ServiceFour, "$get").andCallThrough();
            Injector.registerModule("One", ServiceOne);
            expect(Injector.moduleMap.One).toBeDefined();
            Injector.registerModule("Two", ServiceTwo);
            expect(Injector.moduleMap.Two).toBeDefined();
            Injector.registerModule("Three", ServiceThree);
            expect(Injector.moduleMap.Three).toBeDefined();
            Injector.registerModule("Four", ServiceFour);
            expect(Injector.moduleMap.Four).toBeDefined();
            var result = Injector.invoke(Injector.inject(ServiceFour));

            expect(spy1).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalled();
            expect(spy3).toHaveBeenCalled();
            expect(spy4).toHaveBeenCalled();
            expect(result.number).toBe("one and two and three and four");

        });
    })


    it("should have a function to get a factory/service by name", function(){
        expect(typeof Injector.get).toBe("function");
    });

    describe("get method", function(){
       it("should return a factory/service by name", function(){
           function TestFunction(name){
               this.name = name;
           }

           TestFunction.$get = function(fn){
               return new fn();
           }

           function FinalFunction(Test, name){
               return name +"'s name is "+Test.name;
           }

           Injector.moduleMap.Final = FinalFunction;
           Injector.moduleMap.name = "Senea";
           Injector.moduleMap.Test = TestFunction;

           var result = Injector.get("Final");
           expect(result).toBe("Senea's name is Senea");
           result  = Injector.get("name");
           expect(result).toBe("Senea");
       });


        it("should return a factory/service by name, when that factory has no dependencies", function(){
            function TestFunction(){
                return "senea";
            }

            Injector.moduleMap.Test = TestFunction;
            var result = Injector.get("Test");
            expect(result).toBe("senea");
        });

        it("should return a factory/service by name, when it is registered with the injector", function(){
            Injector.clearModules();
            function serviceConstructor(serviceFn){
                return new serviceFn();
            }
            function ServiceOne(){
                //this.number = "one";
                //return "one";
                this.number = "one";
            }

            function ServiceTwo(One){
                this.number = One.number + " and two";
            }

            function ServiceThree(Two){
                this.number = Two.number + " and three";
            }

            function ServiceFour(Three){
                this.number = Three.number + " and four";
            }

            ServiceOne.$get = serviceConstructor;
            ServiceTwo.$get = serviceConstructor;
            ServiceThree.$get = serviceConstructor;
            ServiceFour.$get = serviceConstructor;


            Injector
                .registerModule("One", ServiceOne)
                .registerModule("Two", ServiceTwo)
                .registerModule("Three", ServiceThree)
                .registerModule("Four", ServiceFour)
            ;

            var one = Injector.get("One");
            expect(one.number).toEqual("one");
            var four = Injector.get("Four");
            expect(four.number).toEqual("one and two and three and four");
            
        });


    });





    describe("Sophisticated DI tests", function(){
        var modules;
        Injector = require("../../lib/injector.js")
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



});