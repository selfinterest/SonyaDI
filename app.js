/**
 * Created by: Terrence C. Watson
 * Date: 7/11/14
 * Time: 12:02 AM
 */
var sonya = require("./src");


sonya.Provide.factory("version", function(){
    return 1;
});

sonya.Provide.service("engine", function(version){
    if(version === 1){
        this.power = 100;
    } else {
        this.power = 50;
    }
});

sonya.Provide.factory("car", function(engine){
   function Car(engine){
    this.engine = engine;
   }

   Car.prototype.turnOn = function(){
       return "The car's engine revs with "+ this.engine.power + " horsepower!";
   }

   return new Car(engine);
});


sonya.Provide.service("owner", function(car, name){
    this.name = name;
    this.car = car;
    this.startCar = function(){
        console.log(this.car.turnOn());
        return "This car belongs to "+this.name;
    }

});

sonya.Provide.value("name", "Terrence");

//var version = sonya.Injector.get("version");
var car = sonya.Injector.get("car");
console.log(car.turnOn());

var owner = sonya.Injector.get("owner");
console.log(owner.startCar());

//var car = sonya.Injector.get("car");

//console.log(result);

