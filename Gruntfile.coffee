module.exports = (grunt) ->
    @loadNpmTasks('grunt-contrib-jshint')
    @loadNpmTasks('grunt-contrib-watch')
    @loadNpmTasks('grunt-mocha-cli')
    @loadNpmTasks('grunt-release')

    @initConfig
        jshint:
            all: ["lib/*.js"]
            options:
                jshintrc: ".jshintrc"

        watch:
            all:
                files: ['src/**.coffee', 'test/**.coffee']
                tasks: ['test']

        mochacli:
            options:
                files: 'test/*_test.coffee'
                compilers: ['coffee:coffee-script']
            spec:
                options:
                    reporter: 'spec'

    @registerTask 'default', ['test']
    @registerTask 'build', ['jshint']
    @registerTask 'package', ['build', 'release']
    @registerTask 'test', ['build', 'mochacli']
