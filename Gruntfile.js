module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-nodemon');

    grunt.initConfig({
        nodemon: {
            dev: {
                options: {
                    file: 'index.js',
                    watchedExtensions: ['js'],
                    watchedFolders: ['src']
                }
            }
        }
    });

    grunt.registerTask('node', ['nodemon:dev']);
};