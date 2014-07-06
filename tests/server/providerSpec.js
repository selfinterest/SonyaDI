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
       expect(Provider.providerTypes).toBeDefined();
   });

    it("should, given a module with resolved dependencies, instantiate that module according to type", function(){
        function TestModule(dummy){

        }

        TestModule.dependencyNames = "dummyModule";
        TestModule.type = "factory";

        function DummyModule(){
            return "dummy";
        }

        //Manually bind
        TestModule = TestModule.bind(TestModule, DummyModule());

    });



});

