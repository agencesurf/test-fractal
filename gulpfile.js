'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));


/*
* Configure a Fractal instance.
*
* This configuration could also be done in a separate file, provided that this file
* then imported the configured fractal instance from it to work with in your Gulp tasks.
* i.e. const fractal = require('./my-fractal-config-file');
*/

const fractal = module.exports = require('@frctl/fractal').create();
const mandelbrot = require('@frctl/mandelbrot');

/* Set the title of the project */
fractal.set('project.title', 'Surf Creative Content Component Library');

/* Destination for the static export */
fractal.web.set('builder.dest', 'build');

/* Tell Fractal where the components will live */
fractal.components.set('path', __dirname + '/src/components');

/* Tell Fractal where the documentation pages will live */
fractal.docs.set('path', __dirname + '/src/docs');

const myCustomisedTheme = mandelbrot({
    skin: 'fuchsia',
    accent: '#fff',
    complement: '#fff',
});
fractal.web.theme(myCustomisedTheme);
// any other configuration or customisation here

const logger = fractal.cli.console; // keep a reference to the fractal CLI console utility

gulp.task('styles', function() {
    return gulp.src('components/**/*.scss')  // Grab all .scss files in components and its subfolders
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(function(file) {
            return file.base;  // This saves the .css file in the same folder as the original .scss file.
        }));
});

gulp.task('watch', function() {
    gulp.watch('components/**/*.scss', gulp.series('styles'));
});

gulp.task('default', gulp.series('styles', 'watch'));

/*
* Start the Fractal server
*
* In this example we are passing the option 'sync: true' which means that it will
* use BrowserSync to watch for changes to the filesystem and refresh the browser automatically.
* Obviously this is completely optional!
*
* This task will also log any errors to the console.
*/

gulp.task('fractal:start', function(){
    const server = fractal.web.server({
        sync: true
    });
    server.on('error', err => logger.error(err.message));
    return server.start().then(() => {
        logger.success(`Fractal server is now running at ${server.url}`);
    });
});

/*
 * Run a static export of the project web UI.
 *
 * This task will report on progress using the 'progress' event emitted by the
 * builder instance, and log any errors to the terminal.
 *
 * The build destination will be the directory specified in the 'builder.dest'
 * configuration option set above.
 */

gulp.task('fractal:build', async function(){
    const builder = fractal.web.builder();
    builder.on('progress', (completed, total) => logger.update(`Exported ${completed} of ${total} items`, 'info'));
    builder.on('error', err => logger.error(err.message));
    await builder.start();
    logger.success('Fractal build completed!!');
});


gulp.task('deploy', function () {
    return gulp.src('./build/**/*')
      .pipe(deploy());
});