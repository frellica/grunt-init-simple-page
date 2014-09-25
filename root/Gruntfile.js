'use strict';

module.exports = function(grunt) {

  var pkg = grunt.file.readJSON('package.json');
  function getVersion() {
    var d = new Date();
    return d.getFullYear() * 1e10 + (d.getMonth() + 1) * 1e8 + d.getDate() * 1e6 + d.getHours() * 1e4 + d.getMinutes() * 1e2 + d.getSeconds();
  }
  if (pkg.enableBuildVersion) {
    pkg.buildVersion = '.' + getVersion();
  }
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
      },
      release: {
        expand: true,
        cwd: 'dev/src',
        src: ['index.html'],
        dest: 'release'
      }
    },    
    uglify: {
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'release/js/main<%= pkg.buildVersion %>.min.js'
      },
      libs: {
        src: '<%= concat.libs.dest %>',
        dest: 'release/js/libs/libs<%= pkg.buildVersion %>.min.js'
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
    },
    cachebreaker: {
      dev: {
        options: {
            match: ['libs.?js', 'main.*.js', 'style.*.css'],
            position: 'filename',
            replacement: 'min' + pkg.buildVersion
        },
        files: {
            src: ['release/index.html']
        }
      }
    },
    clean: {
      release:{
        src: ['release'],
        options: {
          'no-write': false
        }
        // css: ["release/css/*.css", "!release/css/*.<%= pkg.buildVersion %>.min.js"]
      }
    }
  };

  var 
      filesToWatch = ['dev/src/**/*.js', 'dev/src/*.js', 'dev/src/*.html'],
      defaultTasks = ['jshint', 'concat', 'copy:file'],
      deployTasks = ['jshint', 'concat', 'uglify', 'copy:release', 'cachebreaker:dev'];

  switch ( pkg.css_preprocessor ) {

    case "less" :
      configOptions.less = {
        dev: {
          src: 'dev/less/style.less',
          dest: 'build/css/style.css'
        },
        deploy: {
          src: 'dev/less/style.less',
          dest: 'release/css/style.min<%= pkg.buildVersion %>.css',
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
          dest: 'release/css/style.min<%= pkg.buildVersion %>.css'
        }
      };

      filesToWatch.push('dev/sass/*.scss');
      defaultTasks.unshift('sass:dev');
      deployTasks.unshift('sass:deploy');
      break;
    case "css" :
      configOptions.cssmin = {
        dev: {
          expand: true,
          cwd: 'dev/css',
          src: ['*.css'],
          dest: 'build/css'
        },
        deploy: {
          expand: true,
          cwd: 'dev/css',
          src: ['*.css'],
          dest: 'release/css',
          ext: '.min<%= pkg.buildVersion %>.css'
        }
      };
      filesToWatch.push('dev/css/*.css');
      defaultTasks.unshift('cssmin:dev');
      deployTasks.unshift('cssmin:deploy');
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
  deployTasks.unshift('clean:release');
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
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-cache-breaker');

  // Default task.
  grunt.registerTask('default', defaultTasks);
  grunt.registerTask('deploy', deployTasks);

};

