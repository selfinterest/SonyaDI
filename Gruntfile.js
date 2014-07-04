/**
 * Created by: Terrence C. Watson
 * Date: 6/30/14
 * Time: 9:34 PM
 */

module.exports = function(grunt){
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jasmine_node: {
            options: {
                forceExit: true,
                extensions: 'js',
                match: '.',
                matchall: false,
                specNameMatcher: 'spec'
            },
            all: ['tests/server']
        },
        watch: {
            scripts: {
                files: ['src/*.js', 'tests/server/*.js'],
                tasks: ['default'],
                options: {
                    atBegin: true
                }
            }
        }
    });

    grunt.registerTask('default', ['jasmine_node']);


    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-contrib-watch');
}