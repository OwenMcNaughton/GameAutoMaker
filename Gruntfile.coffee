module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')
    concat:
      source:
        src: ["jsnes_src/nes.js", "jsnes_src/utils.js", "jsnes_src/mappers.js",
              "jsnes_src/ui.js", "jsnes_src/cpu.js", "jsnes_src/papu.js", 
              "jsnes_src/ppu.js", "jsnes_src/rom.js", "jsnes_src/keyboard.js"]
        dest: "build/jsnes.js"
    uglify:
      source:
        src: "build/jsnes.js"
        dest: "build/jsnes.min.js"
    jshint:
      source:
        src: "jsnes_src/*.js"

  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-uglify')

  grunt.registerTask('default', ['concat', 'uglify'])