var sonya = require("./lib/main.js");
sonya.Provide.factory("test", function(){

return "test";

});

sonya.Provide.value("test2", "test2");

var result = sonya.Injector.get("test");

console.log(result);

result = sonya.Injector.get("test2");
console.log(result);
