"use strict";

var gulp = require( "gulp" );
var babel = require( "gulp-babel" );
var less = require( "gulp-less" );
const sourcemaps = require( "gulp-sourcemaps" );
var jetpack = require( "fs-jetpack" );

var utils = require( "../utils" );

var projectDir = jetpack;
var srcDir = projectDir.cwd( "./app" );
var destDir = projectDir.cwd( "./build" );

var paths = {
	copyFromAppDir: [
		"./views/**",
		"./node_modules/**",
		"./vendor/**/*.css",
		"./**/*.html",
		"./**/*.+(jpg|png|svg)"
	]
};

// -------------------------------------
// Tasks
// -------------------------------------

gulp.task( "clean", function( callback ) {
	return destDir.dirAsync( ".", { empty: true } );
} );

var compileTask = function() {
	return gulp.src( [ "app/background.js", "app/src/**/*.js", "app/vendor/**/*.js" ], { base: "./app" } )
		.pipe( sourcemaps.init() )
		.pipe( babel( { presets: [ "es2015" ] } ) )
		// .pipe( concat( "all.js" ) )
		.pipe( sourcemaps.write( "." ) )
		.pipe( gulp.dest( "build" ) );
};
gulp.task( "compile", [ "clean" ], compileTask );
gulp.task( "compile-watch", compileTask );

var copyTask = function() {
	return projectDir.copyAsync( "app", destDir.path(), {
		overwrite: true,
		matching: paths.copyFromAppDir
	} );
};
gulp.task( "copy", [ "clean" ], copyTask );
gulp.task( "copy-watch", copyTask );

var lessTask = function() {
	return gulp.src( "app/styles/main.less" )
	.pipe( less() )
	.pipe( gulp.dest( destDir.path( "styles" ) ) );
};
gulp.task( "less", [ "clean" ], lessTask );
gulp.task( "less-watch", lessTask );

gulp.task( "finalize", [ "clean" ], function() {
	var manifest = srcDir.read( "package.json", "json" );

	// Add "dev" or "test" suffix to name, so Electron will write all data
	// like cookies and localStorage in separate places for each environment.
	switch ( utils.getEnvName() ) {
		default:
		case "development":
			manifest.name += "-dev";
			manifest.productName += " Dev";
			break;
		case "test":
			manifest.name += "-test";
			manifest.productName += " Test";
			break;
	}

	// Copy environment variables to package.json file for easy use
	// in the running application. This is not official way of doing
	// things, but also isn't prohibited ;)
	manifest.env = projectDir.read( "config/env_" + utils.getEnvName() + ".json", "json" );

	destDir.write( "package.json", manifest );
} );

gulp.task( "watch", function() {
	gulp.watch( "app/**/*.js", [ "compile-watch" ] );
	gulp.watch( paths.copyFromAppDir, { cwd: "app" }, [ "copy-watch" ] );
	gulp.watch( "app/**/*.less", [ "less-watch" ] );
} );

gulp.task( "build", [ "compile", "less", "copy", "finalize" ] );
