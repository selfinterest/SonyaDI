/**
 * The module object that keeps track of information used by the injector.
 * @param {function} moduleFunction
 * @returns {SonyaModule}
 * @constructor
 */
function SonyaModule(moduleFunction){
    if(this instanceof SonyaModule){
        if(!moduleFunction) throw new Error("Must supply function or a provider object!");

        if(typeof moduleFunction == "function" || !moduleFunction.$get) {
            this.$get = moduleFunction;
        } else if (typeof moduleFunction == "object" && moduleFunction.$get) { //a provider
            //We simply copy properties from the object over to the sonya module object
            for(var p in moduleFunction){
                if(moduleFunction.hasOwnProperty(p)){
                    this[p] = moduleFunction[p];
                }
            }
        } else {
            throw new Error("Module function format not recognized.")
        }
    } else {
        return new SonyaModule(moduleFunction);
    }

}


module.exports = SonyaModule;

