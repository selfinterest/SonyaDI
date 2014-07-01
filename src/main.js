/**
 * Created by: Terrence C. Watson
 * Date: 6/29/14
 * Time: 10:58 PM
 */

var Loader = require("./loader.js")
    , express = require("express");

function AngularLoader(options){

    return Loader.initialize(options, express.Router());


}

module.exports = AngularLoader;