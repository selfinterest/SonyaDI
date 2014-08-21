/**
 * Created by: Terrence C. Watson
 * Date: 7/11/14
 * Time: 12:00 AM
 */


var Provide = require("./provide.js");
var Injector = require("./injector.js");

function Sonya(){
    if(this instanceof Sonya){
        this.Injector = Injector();
        this.Provide = Provide(this.Injector);

    } else {
        return new Sonya();
    }
}

Sonya.Injector = Injector();
Sonya.Provide = Provide(Sonya.Injector);


module.exports = Sonya;