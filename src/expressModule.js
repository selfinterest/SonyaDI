/**
 * Created by: Terrence C. Watson
 * Date: 6/30/14
 * Time: 10:11 PM
 */
var express = require("express");
var mixin = require("utils-merge");
var Dependency = require("./dependency.js");

function ExpressModule(options, dummy){
    return express.Router();
}

ExpressModule.type = "factory";
ExpressModule.dependencies = ["dummyModule"];

module.exports = mixin(ExpressModule, Dependency);
