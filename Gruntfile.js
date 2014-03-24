module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-cli');
    grunt.loadNpmTasks('grunt-release');

    grunt.initConfig({
        jshint: {
            all: ["lib/*.js", "test/*.js", "Gruntfile.js"],
            options: {
                jshintrc: ".jshintrc"
            }
        },
        watch: {
            all: {
                files: ['lib/**.js', 'test/**'],
                tasks: ['test']
            }
        },
        mochacli: {
            options: {
                files: ['test/*_test.js'],
            },
            spec: {
                options: {
                    reporter: 'spec',
                    slow: 2000,
                    timeout: 10000
                }
            }
        },
        release: {
            options: {
                npm: false
            }
        }
    });

    grunt.registerTask('default', ['test']);
    grunt.registerTask('build', ['jshint']);
    grunt.registerTask('package', ['build', 'release']);
    grunt.registerTask('test', ['build', 'mochacli']);
};
