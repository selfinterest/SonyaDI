/**
 * Created by: Terrence C. Watson
 * Date: 6/29/14
 * Time: 11:08 PM
 */
angular.module("TestApp", ["ui.router"])
    .run(["$rootScope", function($rootScope){
        "use strict";

        $rootScope.$on("$stateChangeError", function(){
            console.log("ERROR");
            console.log(arguments);
        });
    }])
    .config(["$stateProvider", function($stateProvider){
        "use strict";
        $stateProvider
            .state("main", {
                url: "",
                abstract: true,
                template: "<div ui-view></div>",
                controller: function(loader){
                  console.log("HERE1");
                    console.log(loader);
                },
                resolve: {
                    "loader": ["$http", "$q", function($http, $q){
                        var defer = $q.defer();
                        $http.get("/angular").then(function(){
                            defer.resolve(arguments);
                        })

                        return defer.promise;
                    }]
                    //"tLoader": "DynamicLoader",
                    /*"loader": function(DynamicLoader, $q){
                        console.log(DynamicLoader);
                        return DynamicLoader;

                    }*/
                }
            })
            .state("main.index", {
                url: "/",
                template: "<div></div>",
                controller: function(){
                  console.log("HERE2");
                },
                /*resolve: {
                    "loader": function(loader){
                        return loader;
                    }
                }*/
            });
            /*.state("index", {
                url: "/",
                //resolve: {
                //    "loader": "loader"
                //},
                //controller: "InnerController",
                template: "<div></div>"
            })*/
    }])
    /*.controller("TestController", ["$scope", "DynamicLoader", function($scope, DynamicLoader){
        "use strict";
        //console.log(DynamicLoader);

    }])*/
    .controller("InnerController", ["$scope", "DynamicLoader", function($scope, DynamicLoader, loader){
        "use strict";
        console.log("HERE");
        console.log(DynamicLoader);
        console.log(loader);
    }])
    .provider("DynamicLoader", [function(){

        var loader = (function(){
            "use strict";
            var self = {};
            self.setupCompleted = false;


            //Some default options
            self.options = {};
            self.options.method = "get";
            self.options.url = "/angular";

            self.setDeferredObject = function(deferredObject){
                self.deferred = deferredObject;
                return self;
            }

            self.getDeferredObject = function(){
                return self.deferred || null;
            }

            /**
             * Sets up the loader. Resolves the deferred object when complete
             * @param data
             */
            self.setup = function(data){

            }

            return self;

        })();

        this.setMethod = function(method){
            "use strict";
            loader.options.method = method;
        }

        this.setUrl = function(url){
            "use strict";
            loader.options.url = url;
        }


        var defer = null;
        this.$get = ["$http", "$q", function($http, $q){
            var work = $http[loader.options.method](loader.options.url);
            return work;
            //If the loader has been setup, just return the loader
            //if(loader.setupCompleted) {
            //    return loader;
            //} else {
                /*if(!defer) {
                    defer = $q.defer();
                    $http[loader.options.method](loader.options.url).success(function(data){
                        loader.setup(data);
                        defer.resolve(loader);
                    }).error(function(){
                        "use strict";
                        throw new Error("MIDDLEWARE NOT LOADED ON SERVER");
                    })
                }*/

                //return defer.promise;
            //}


        }];
    }]);