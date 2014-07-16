
function SonyaModule(moduleFunction){
    if(this instanceof SonyaModule){
        if(!moduleFunction) throw new Error("Must supply function");
        //this.name = name;
        if(typeof moduleFunction == "function" || !moduleFunction.$get) {
            this.$get = moduleFunction;
        } else if (typeof moduleFunction == "object" && moduleFunction.$get) { //a provider
            //We simply copy properties from the object over to the sonya module object
            for(var p in moduleFunction){
                if(moduleFunction.hasOwnProperty(p)){
                    this[p] = moduleFunction[p];
                }
            }
        }
    } else {
        return new SonyaModule(moduleFunction);
    }

}


module.exports = SonyaModule;

