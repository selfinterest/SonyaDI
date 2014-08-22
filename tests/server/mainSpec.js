/**
 * Created by: Terrence C. Watson
 * Date: 7/16/14
 * Time: 4:10 PM
 */
describe("main module test (integration)", function(){
    var sonya;
    beforeEach(function(){
       sonya = require("../../lib/main.js");
    });

    it("should have provide and inject methods", function(){
       expect(sonya.Provide).toBeDefined();
       expect(sonya.Injector).toBeDefined();
    });

    it("should be able to provide factories, etc", function(){
       sonya.Provide
           .service("Senea", function(name, age){
                this.name = name;
                this.age = age;
           })
           .value("name", "Senea")
           .value("age", "6");
       var senea = sonya.Injector.get("Senea");
       expect(senea.name).toBe("Senea");
       expect(senea.age).toBe("6");
       var age = sonya.Injector.get("age");
       expect(age).toBe("6");
    });

    it("should be able to provide services with complex dependency relationships", function(){
       sonya.Provide
           .factory("Cat", function(animal){
               function Cat(name, age){
                   this.type = animal.type;
                   this.name = animal.name;
                   this.age = age;
                   this.noise = "meow";
               }

               return Cat;
           })
           .factory("animal", function(name){
               return {
                   type: "feline",
                   name: name
               }
           })
           //.service("animal", function(animal){
           //    this.type = "feline";
           //});
        var Cat = sonya.Injector.get("Cat");
        var senea = new Cat("Amala", 6);
        expect(senea.name).toBe("Senea");
        expect(senea.type).toBe("feline");
        expect(senea.noise).toBe("meow");
    });

    it("should throw an error if there are circular dependencies", function(){
       sonya.Provide
           .factory("One", function(Two){
              return Two;
           })
           .factory("Two", function(One){
              return One;
           });
       expect(function(){
           sonya.Injector.get("One");
       }).toThrow("Circular dependency error!");
    });

    it("should only resolve modules once", function(){
       var aModule = {};
       var callCount = 0;
       aModule.fn = function(){
           callCount++;
           return "I only resolve once.";
       };
       var spy = spyOn(aModule, "fn").andCallThrough();
       sonya.Provide.factory("resolveOnce", aModule.fn);
       var result = sonya.Injector.get("resolveOnce");
       expect(spy).toHaveBeenCalled();
       expect(callCount).toBe(1);

    });

    it("should only resolve modules once even if the module is used multiple times as a dependency", function(){
        var aModule = {};
        var callCount = 0;

        aModule.fn1 = function(){
            callCount++;
            return "one";
        }
        aModule.fn2 = function(fn1){
            return fn1 + " and two.";
        }

        aModule.fn3 = function(fn1){
            return fn1 + " and three.";
        }

        sonya.Provide.factory("fn1", aModule.fn1);
        sonya.Provide.factory("fn2", aModule.fn2);
        sonya.Provide.factory("fn3", aModule.fn3);

        var result1 = sonya.Injector.get("fn2");
        var result2 = sonya.Injector.get("fn3");

        expect(result1).toBe("one and two.");
        expect(result2).toBe("one and three.");
        expect(callCount).toBe(1);

    });

    it("should pass this test", function(){
        function one(){
            return "one";
        }

        function two(one){
            return one + " and two.";
        }

        function three(one){
            return one + " and three.";
        }

        function numbers(one, two, three){
            this.one = one;
            this.two = two;
            this.three = three;
        }

        sonya.Provide.factory("one", one);
        sonya.Provide.factory("two", two);
        sonya.Provide.factory("three", three);
        sonya.Provide.service("numbers", numbers);

        sonya.Injector.invoke(function(one, two, three, numbers){
            expect(one).toBe("one");
            expect(two).toBe("one and two.");
            expect(three).toBe("one and three.");
            expect(numbers.one).toBe("one");
            expect(numbers.two).toBe("one and two.");
            expect(numbers.three).toBe("one and three.");
        });

    })

    it("should pass this test, too", function(){
        function oneFactory(){
            return "one";
        }

        sonya.Provide.factory("one", oneFactory);

        var injectedFunction = sonya.Injector.bind(function(one, test){
            return one + " and two and " + test;
        });

        console.log(injectedFunction);

        var result = injectedFunction("test");
        expect(result).toBe("one and two and test");
    })

});