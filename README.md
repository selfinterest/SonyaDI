Sonya
=======================

Very simple dependency injection for Node, inspired largely by [AngularJS](https://angularjs.org/).

By design, Sonya is not meant to take over your application. This distinguishes it from other frameworks that use dependency injection but also have a lot of opinions on how you should organize or write your code.

Sonya isn't like that. It isn't a framework at all. It's simply a tool that registers dependencies, resolves the relationships between them, and injects functions with the newly resolved depenencies.

That's it. Nothing complicated. Sonya uses simple functions as modules and can infer dependency names from function arguments just like Angular can.

With Sonya, you can do this:

```javascript
var sonya = require("sonya");

function one(){
    return "one";
}

function two(one){
    return one + " and two.";
}

function three(one){
    return one + " and three.";
}

function numbers(one, two, three){
    this.one = one;
    this.two = two;
    this.three = three;
}

sonya.Provide
  .factory("one", one);
  .factory("two", two);
  .factory("three", three);
  .service("numbers", numbers);

sonya.Injector.invoke(function(one, two, three, numbers){
    expect(one).toBe("one");
    expect(two).toBe("one and two.");
    expect(three).toBe("one and three.");
    expect(numbers.one).toBe("one");
    expect(numbers.two).toBe("one and two.");
    expect(numbers.three).toBe("one and three.");
});
```
As simple as it is, Sonya is extensible. New providers can be added just by adding properties to provide-class's prototype. Example:

```javascript
var provideClass = require("sonya/lib/provide-class.js");
provideClass.prototype.types.fromDirectory = function(){
  //More code goes here

}
```

Then, later in the application:

```javascript
var sonya = require("sonya");
sonya.Provide.fromDirectory("./all_my_modules");
```

Tests
-----

You must have grunt installed. In module directory, just run "grunt".