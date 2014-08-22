'use strict';

module.exports = function(grunt) {

  var pkg = grunt.file.readJSON('package.json');

  // Project configuration.
  var configOptions = {

    pkg: pkg,
    
    concat: {
      dist: {
        src: [
          'dev/src/main.js'
        ],
        dest: 'build/js/main.js'
      },
      libs : {
        src : [
          'node_modules/jquery/dist/jquery.min.js',
          'dev/src/libs/*.js'
        ],
        dest: 'build/js/libs/libs.js'
      }
    },
    copy: {
      file: {
        expand: true,
        cwd: 'dev/src',
        src: ['index.html'],
        dest: 'build'
      }
    },    
    uglify: {
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'build/js/main.min.js'
      },
      libs: {
        src: '<%= concat.libs.dest %>',
        dest: 'build/js/libs/libs.min.js'
      }
    },

    jshint: {
      gruntfile: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: 'Gruntfile.js'
      },
      src: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: '<%= concat.dist.src %>'
      }
    },
    connect: {
      options: {
        port: 80,
        keepalive: true,
        hostname: '*'
      },
      server:{
        base: './'
      }
    }
  };

  var 
      filesToWatch = ['dev/src/**/*.js', 'dev/src/*.js'],
      defaultTasks = ['jshint', 'concat', 'copy:file'],
      deployTasks = ['jshint', 'concat', 'uglify', 'copy:file'];

  switch ( pkg.css_preprocessor ) {

    case "less" :
      configOptions.less = {
        dev: {
          src: 'dev/less/style.less',
          dest: 'build/css/style.css'
        },
        deploy: {
          src: 'dev/less/style.less',
          dest: 'build/css/style.css',
          options: {
            compress: true
          }
        }
      };

      filesToWatch.push('dev/less/*.less');
      defaultTasks.unshift('less:dev');
      deployTasks.unshift('less:deploy');
      break;

    case "sass" : 
      configOptions.sass = {
        dev: {
          src: 'dev/sass/style.scss',
          dest: 'build/css/style.css',
          options: {
            style: 'expand',
            compass : true
          }
        },
        deploy: {
          src: 'dev/sass/style.sass',
          dest: 'build/css/style.css'
        }
      };

      filesToWatch.push('dev/sass/*.scss');
      defaultTasks.unshift('sass:dev');
      deployTasks.unshift('sass:deploy');
      break;
    case "css" :
      configOptions.cssmin = {
        build: {
          expand: true,
          cwd: 'dev/css',
          src: ['*.css'],
          dest: 'build/css'
        }
      };
      filesToWatch.push('dev/css/*.css');
      defaultTasks.unshift('cssmin:build');
      // deployTasks.unshift('cssmin:build');
      break;
  }

  configOptions.watch = {
    gruntfile: {
      files: '<%= jshint.gruntfile.src %>',
      tasks: ['jshint:gruntfile']
    },
    test: {
      files: filesToWatch,
      tasks: 'default'
    }
  };

  grunt.initConfig(configOptions);

  // These plugins provide necessary tasks.
  if (pkg.css_preprocessor != "css") {
    grunt.loadNpmTasks('grunt-contrib-{%= css_preprocessor %}');
  } else {
    grunt.loadNpmTasks('grunt-contrib-cssmin');
  }
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Default task.
  grunt.registerTask('default', defaultTasks);
  grunt.registerTask('deploy', deployTasks);

};
