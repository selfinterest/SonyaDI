/**
 * Created by: Terrence C. Watson
 * Date: 6/29/14
 * Time: 11:30 PM
 */
describe("AngularLoader provider", function(){
    "use strict";
    var $httpBackend;
    beforeEach(module("TestApp"));

    beforeEach(function(){
        var fakeModule = angular.module('FakeModule', function () {});
        fakeModule.config( function (DynamicLoaderProvider) {
            DynamicLoaderProvider.setUrl("/test");
        });
    });
    beforeEach(module("FakeModule"));

   beforeEach(inject(function($injector) {
        // Set up the mock http service responses
        $httpBackend = $injector.get('$httpBackend');
        $httpBackend.expect("GET", "/test").respond({ok: true});
   }));

    it("should exist", inject(function(DynamicLoader){
        expect(DynamicLoader).toBeDefined();
    }));

    xit("should be a promise that resolves into the service", inject(function(DynamicLoader, $rootScope, $q, $injector){
        $q.when(DynamicLoader).then(function(loader){
            expect(loader.options.url).toBe("/test");
            expect(loader.setupCompleted).toBe(true);
            expect($injector.get("DynamicLoader") === loader);          //once the promise is resolved, the injector gets the loader, not the promise
        });
        $rootScope.$apply();
        $httpBackend.flush();

    }));

})