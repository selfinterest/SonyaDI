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

Why Sonya?
----------
I started writing Sonya when I realized my client-side JavaScript was cleaner than my server-side JavaScript. And it wasn't just me. Working on a team, I found the server code was almost always harder to understand, and quite a bit messier. After reading Robert Martin's [clean code book](http://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882), I realized cleanliness was an obligation -- and that I had to make it happen on the server as well as the client.

Why was the client code cleaner? One reason was Angular. JavaScript is a highly expressive language, but that expressiveness can have a downside. Client-side, Angular, and specifically its implementation of dependency injection, tames some of JavaScript's inherent wildness. I wondered if I could tame server side JavaScript that way. But I didn't want to "re-create" Angular on the server. Instead, I sought to distill the Angular approach into two simple tools, a Provide module and an Injector module.

Tests
-----
You must have grunt installed. In module directory, just run "grunt".