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
  .factory("one", one)
  .factory("two", two)
  .factory("three", three)
  .service("numbers", numbers)
  ;


sonya.Injector.invoke(function(one, two, three, numbers){
    expect(one).toBe("one");
    expect(two).toBe("one and two.");
    expect(three).toBe("one and three.");
    expect(numbers.one).toBe("one");
    expect(numbers.two).toBe("one and two.");
    expect(numbers.three).toBe("one and three.");
});
```
As simple as it is, Sonya is extensible. New providers can be easily added to extend its capabilities. For an example, see my [sonya-from-directory](https://www.npmjs.org/package/sonya-from-directory) module.

Provider API
----------
The Provider API is simple:
```javascript
  var sonya = require("sonya");
  sonya.Provide.factory("nameOfFactory", someFactoryFunction); //provides a factory
  sonya.Provide.service("nameOfService", someServiceFunction); //provides a service
  sonya.Provide.value("someValue", "I am a value"); //provides a value
```

This will register the factory or the service under the given name. That name can then be used to inject the factory into other functions. The difference between `Provide.factory` and `Provide.service` is that the resolved value of the factory function (the value actually injected) will be whatever is returned from the factory function. With `Provide.service`, the service function will be invoked with the `new` keyword, and the new object will be injected as the resolved value.

It's important to note that factories and services are resolved only ONCE. If a factory or service is injected into different functions, each of these functions receive the same copy of the factory or service. This is how dependency injection is supposed to work.

Injector API
------------
The Injector has several methods. The most useful one is probably `Injector.invoke()`. This method takes up to three arguments: a function, an object, and a map of local dependencies. The method injects dependencies into the function and executes it with the object (the second argument) as `this`. The localArgs map can be used to supply additional dependencies. Only the first argument is required.

`Injector.bind()` takes the same arguments as invoke, but does not execute the function immediately. Instead, it returns a new function with the dependencies pre-bound to it. This new function can then be executed at a later point, and additional arguments can be provided.

```javascript
   sonya.Provide.factory("someFactory", function(){
     return "factory";
   });

   var fn = sonya.Injector.bind(function(someFactory, someOtherValue){
    expect(someFactory).toBe("factory");
    expect(someOtherValue).toBe("someValue");
   });

   fn("someValue);
```

There are also `invokeSync()` and `bindSync()` methods. These methods are for situations where factories (typically) will be returning promises. The function passed to `invokeSync()` will only be executed when all promises are resolved, and the resolved values will be injected.

`bindSync()` will return a version of the function passed to it that, when executed, will not proceed until all promises are resolved.

Finally, the Injector has a new feature for the latest version (this applies to all invoke, bind, etc.) If a dependency is not registered, rather than immediately throwing an error, the Injector will try to require it with Node's require function. Thus, you can now inject standard Node modules into your functions.


Why Sonya?
----------
I started writing Sonya when I realized my client-side JavaScript was cleaner than my server-side JavaScript. And it wasn't just me. Working on a team, I found the server code was almost always harder to understand, and quite a bit messier. After reading Robert Martin's [clean code book](http://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882), I realized cleanliness was an obligation -- and that I had to make it happen on the server as well as the client.

Why was the client code cleaner? One reason was Angular. JavaScript is a highly expressive language, but that expressiveness can have a downside. Client-side, Angular, and specifically its implementation of dependency injection, tames some of JavaScript's inherent wildness. I wondered if I could tame server side JavaScript that way. But I didn't want to "re-create" Angular on the server. Instead, I sought to distill the Angular approach into two simple tools, a Provide module and an Injector module.

Tests
-----
You must have grunt installed. In module directory, just run "grunt".