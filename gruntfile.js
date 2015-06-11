module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  
  grunt.initConfig({
    browserify: {
      app: {
        files: {
          'build/app.js': ['js/app/app.js']
        }
      }
    },

    watch: {
      app: {
        files: 'js/app/**/*.js',
        tasks: ['browserify']
      }
    }
  });

  grunt.registerTask('default', ['browserify', 'watch']);
};