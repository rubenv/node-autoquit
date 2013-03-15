module.exports = (grunt) ->
    @loadNpmTasks('grunt-contrib-jshint')
    @loadNpmTasks('grunt-contrib-watch')
    @loadNpmTasks('grunt-mocha-cli')
    @loadNpmTasks('grunt-release')

    @initConfig
        jshint:
            all: ["lib/*.js", "test/*.js"]
            options:
                jshintrc: ".jshintrc"

        watch:
            all:
                files: ['lib/**.js', 'test/**', 'Gruntfile.coffee']
                tasks: ['test']

        mochacli:
            options:
                files: 'test/*_test.coffee'
                compilers: ['coffee:coffee-script']
            spec:
                options:
                    reporter: 'spec'
                    slow: 2000
                    timeout: 10000

    @registerTask 'default', ['test']
    @registerTask 'build', ['jshint']
    @registerTask 'package', ['build', 'release']
    @registerTask 'test', ['build', 'mochacli']
