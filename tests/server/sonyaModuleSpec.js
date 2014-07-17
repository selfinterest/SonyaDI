/**
 * Created by: Terrence C. Watson
 * Date: 7/15/14
 * Time: 7:32 PM
 */
describe("Sonya Module class", function(){
   var SonyaModule = require("../../lib/lib/sonya-module.js");
   it("should exist", function(){
      expect(SonyaModule).toBeDefined();
   });
   it("should create a sonya module", function(){
      var sonyaModule = SonyaModule(function(){});
      expect(sonyaModule).toBeDefined();
      expect(sonyaModule instanceof SonyaModule).toBe(true);
   });

   it("should throw an error if constructor is given insufficient parameters", function(){
      expect(function(){
          var sonyaModule = SonyaModule();
      }).toThrow("Must supply function or a provider object!");
   });


   describe("Sonya module", function(){
    var sonyaModule, TestFunction;
    beforeEach(function(){
        TestFunction = function(){

        };
        sonyaModule = SonyaModule(TestFunction);
    });


    it("should have a $get property that is identical to the module function", function(){
        expect(sonyaModule.$get).toBeDefined();
        expect(sonyaModule.$get).toBe(TestFunction);
    });
   });
});