/**
 * Created by: Terrence C. Watson
 * Date: 7/3/14
 * Time: 9:31 PM
 */

describe("Injector service", function(){
   var Injector;

   beforeEach(function(){
      Injector = require("../../lib/injector.js");
      Injector.moduleMap = {};
   });

    it("should be able to register a module", function(){
        Injector.registerModule("testModule", function(){});
        expect(Injector.moduleMap.testModule).toBeDefined();
    });

    describe("annotate method", function(){
        it("should be able to annotate a function with implicit dependencies", function(){
            function Person(name){

            }
            var annotatedFunction = Injector.annotate(Person);
            expect(annotatedFunction.$inject).toBeDefined();
            expect(annotatedFunction.length).toBe(1);
            expect(Array.isArray(annotatedFunction.$inject)).toBeTruthy();
            function Person2(name, age){

            }
            annotatedFunction = Injector.annotate(Person2);
            expect(annotatedFunction.$inject).toBeDefined();
        });

        it("should be able to annotate a function with explicit, Angular-style array dependencies", function(){
            var fnArray = ["name", "age", function(n, a){

            }];

            var annotatedFunction = Injector.annotate(fnArray);
            expect(typeof annotatedFunction).toBe("function");
            expect(annotatedFunction.$inject).toBeDefined();
            expect(annotatedFunction.$inject.length).toBe(2);
            expect(annotatedFunction.$inject[0]).toBe("name");
            expect(Array.isArray(annotatedFunction.$inject)).toBe(true);
        });

        it("should do nothing to a function that has an $inject property", function(){
            function Person(name, age){

            }
            Person.$inject = ["name", "age"];
            var annotatedFunction = Injector.annotate(Person);
            expect(Person).toBe(annotatedFunction);
        });

        it("should provide an empty $inject array for functions with no dependencies", function(){
            function Person(){

            }
            var annotatedFunction = Injector.annotate(Person);
            expect(Person.$inject).toBeDefined();
            expect(Person.$inject.length).toBe(0);
            expect(Array.isArray(Person.$inject)).toBe(true);
        });

    });

    describe("invoke method", function(){
        it("should be able to execute a function after injecting dependencies", function(){
           //Mock get function

           Injector.get = function(name){
               return this.invoke(this.moduleMap[name]);
           }

           function test(name){
               return "Name is "+name;
           }

           Injector.moduleMap.name = "Terrence";
           var result = Injector.invoke(test);
           expect(result).toBe("Name is Terrence");
           function test2(name, noise){
                return "The cat's name is "+name+" and her noise is "+noise;
           }
           Injector.moduleMap.noise = "meow";
           Injector.moduleMap.name = "Senea";
           result = Injector.invoke(test2);
           expect(result).toBe("The cat's name is Senea and her noise is meow");

        });

        it("should be able to execute a function after injecting dependencies and supplying additional arguments", function(){
            Injector.get = function(name){
                return this.moduleMap[name];
            }
            Injector.moduleMap.name = "Senea";
            Injector.moduleMap.noise = "meow";

            function test(age, name, noise){
                return "The cat's name is " + name + " and she is " + age + " years old. " + noise + "!";
            }

            var result = Injector.invoke(test, test, {age: 5});
            expect(result).toBe("The cat's name is Senea and she is 5 years old. meow!");
        });

        it("should throw an error if dependencies are missing", function(){

           Injector.get = function(name){
               return this.moduleMap[name];
           };
           Injector.moduleMap.name = "Senea";
           Injector.moduleMap.noise = "meow";

           function test(age, name, noise){

           }
           expect(function(){
               Injector.invoke(test, test);
           }).toThrow("Dependency age is not registered");

        });

    });

    describe("instantiate method", function(){
        Injector = require("../../lib/injector.js");

        Injector.moduleMap = {};
        Injector.moduleMap.name = {
            $get: "Senea",
            $invoke: function(){
                return this.$get;
            }
        };
        Injector.moduleMap.noise = {
            $get: "meow!",
            $invoke: function(){
                return this.$get;
            }
        };

        Injector.get = function(name){
            return this.instantiate(this.moduleMap[name]);
        };


        Injector.moduleMap.catModule = {
            $get: function(name, noise){
                return name + " says " + noise;
            },
            $invoke: function(){
                return this.$get();
            }
        }

        var cat = Injector.instantiate(Injector.moduleMap.catModule);

        expect(cat).toBe("Senea says meow!");
    });

    describe("inject method", function(){
        var Injector;
        beforeEach(function(){
            Injector = require("../../lib/injector.js");
            Injector.moduleMap = {};

            Injector.get = function(name){
                return this.moduleMap[name];
            }
        })


        it("should be able to inject a function with no dependencies, simply returning that function", function(){
            function test(){
                return "Senea";
            }
            test.$inject = [];
            var injected = Injector.inject(test);
            expect(injected).toBeDefined();
            expect(injected).toBe(test);
            expect(injected()).toBe("Senea");
        });

        it("should be able to inject a function with a single dependency, a value", function(){
           function test(name){
            return name;
           }
           test.$inject = ["name"];
           Injector.moduleMap.name = "Senea";
           var injected = Injector.inject(test);
           expect(injected.$inject[0]).toBe("Senea");

        });

        it("should be able to inject a function with a single dependency, a function", function(){
           Injector.get = function(name){
               return Injector.moduleMap[name]();
           }
           function test(name){
               return name();
           }
           test.$inject = ["name"];
           Injector.moduleMap.name = function(){ return "Senea"};
           var injected = Injector.inject(test);
           expect(injected.$inject[0]).toBe("Senea");
        });

        it("should be able to inject a function with multiple dependencies", function(){
           Injector.get = function(name){
               if(typeof Injector.moduleMap[name] == "function"){
                   return Injector.moduleMap[name]();
               } else {
                   return Injector.moduleMap[name];
               }
           }

           function test(name, noise){
               return name + " goes " + noise;
           }
           Injector.moduleMap.name = "Senea";
           Injector.moduleMap.noise = function(){ return "Meow!"};
           test.$inject = ["name", "noise"];
           var injected = Injector.inject(test);
           expect(injected.$inject[0]).toBe("Senea");
           expect(injected.$inject[1]).toBe("Meow!");
        });


    });

});

xdescribe("New injector", function(){
    var Injector;

    beforeEach(function(){
        Injector = require("../../lib/injector.js");
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

            TestFunction.$inject = ["name"];

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
        Injector = require("../../lib/injector.js");
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

    })



});