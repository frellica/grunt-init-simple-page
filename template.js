/*
 * grunt-init-empty
 *
 */

'use strict';

var exec = require('child_process').exec, 
    child;

// Basic template description.
exports.description = 'Create a base empty jquery js project';

// Template-specific notes to be displayed before question prompts.
exports.notes = 'Project made by gilbetliu.';

// Template-specific notes to be displayed after question prompts.
// exports.after = 'The bash should now install all the npm dependencies';

// Any existing file or directory matching this wildcard will cause a warning.
exports.warnOn = '*';

// The actual init template.
exports.template = function(grunt, init, done) {

  init.process({type: 'jquery'}, [
    
    // Prompt for these values.
    init.prompt('name'),
    init.prompt('title'),
    // {
    //     name: 'namespace',
    //     message: 'Namespace of the project',
    //     default: 'NS', 
    //     validator: /^[A-Z]{0,9}$/,
    //     warning: 'Must be only letters, max 9'
    // },
    init.prompt('description', 'description here.'),
    init.prompt('version'),
    // init.prompt('repository'),
    // init.prompt('homepage'),
    // init.prompt('bugs'),
    // init.prompt('licenses', 'MIT'),
    init.prompt('author_name'),
    // init.prompt('author_email'),
    // init.prompt('author_url'),
    // init.prompt('jquery_version', '1.11.1'),
    {
        name: 'css_preprocessor',
        message: 'CSS Preprocessor',
        default: 'css', 
        validator: /^(less|sass|css)$/,
        warning: 'Currently Supported : less, sass and bare css'
    }

  ], function(err, props) {

    props.keywords = [];
    
    // Files to copy (and process).
    var files = init.filesToCopy(props);

    // Add properly-named license files.
    // init.addLicenseFiles(files, props.licenses);

    // Actually copy (and process) files.
    init.copyAndProcess(files, props);

    // Generate package.json file.
    init.writePackageJSON('package.json', props, function( pkg, props ){

        // pkg.namespace = props.namespace;
        pkg.css_preprocessor = props.css_preprocessor;
        // pkg.jquery_version = props.jquery_version;

        var devDependencies = {
            "grunt" : "x",
            "grunt-contrib-watch" : "x", 
            "grunt-contrib-concat" : "x", 
            "grunt-contrib-copy" : "x", 
            "grunt-contrib-clean" : "x", 
            "grunt-contrib-connect" : "x", 
            "grunt-contrib-uglify" : "x", 
            "grunt-contrib-jshint" : "x", 
            "jquery" : "1.11.1", 
            // "backbone" : "x"
        };
        if (props.css_preprocessor != "css") {
            devDependencies["grunt-contrib-" + props.css_preprocessor] = "x";
        } else {
            devDependencies["grunt-contrib-cssmin"] = "x";
        }
        pkg.devDependencies = devDependencies;
        return pkg;
    });
    
    // Delete unused preprocessor
    var cssPreprocessors = ["less", "sass", "css"];
    for ( var i = 0, max = cssPreprocessors.length; i < max; i++ ) {
        if ( cssPreprocessors[i] != props.css_preprocessor ) {
            grunt.file.delete( "dev/" + cssPreprocessors[i] + "/" );
        }
    }

    // Install all the npm modules necessary
    console.log("Installing npm modules...");

    exec("npm install --save-dev", function(error,stdout,stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        }
        done();
    });

  });

};
