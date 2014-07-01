/**
 * Created by: Terrence C. Watson
 * Date: 6/30/14
 * Time: 4:09 PM
 */

"use strict";

var _ = require("underscore");

var loader = (function(exports){
    var self = {};  //private variables

    var DEFAULT_OPTIONS = {
        resourcePath: "./resources"
    };

    //Private methods (my bet is that I will be able to straightforwardly replace these private methods for the client side module.)
    self.initializeRouter = function(router){
        router.get("/", function(req, res){
            res.send({ok: true});
        });
    };

    exports.resources = {
        getPath: function(){
            return self.options.resourcePath;
        }
    };

    exports.initialize =  function(options, router){
        self.options = options || {};
        self.options = _.defaults(self.options, DEFAULT_OPTIONS);

        self.initializeRouter(router);
        return router; //Must return router
    };

})(typeof exports === 'undefined'? this['loader']={}: exports);



