Sonya
=======================

Very simple dependency injection for Node.

By design, Sonya is not meant to take over your application (ahem, RequireJS!)

It uses simple functions as modules and supports both Angular-style annotations AND inferring dependencies from function arguments.

With Sonya, you can do this:

```javascript
var sonya = require("sonya");

sonya.Provide.value("version", 1);

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

var car = sonya.Injector.get("car");
console.log(car.turnOn());  //"The car's engine revs with 100 horsepower!"

var owner = sonya.Injector.get("owner");

console.log(owner.startCar());

//The car's engine revs with 100 horsepower.
//This car belongs to Terrence
```