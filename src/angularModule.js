/**
 * Created by: Terrence C. Watson
 * Date: 7/6/14
 * Time: 12:58 AM
 */

function AngularModule(router){
    console.log("Setting up router");
    router.get("/", function(req, res){
        res.send("Angular module is loaded");
    });

    return router;
}

AngularModule.dependencyNames = ["ExpressModule"];

module.exports = AngularModule;