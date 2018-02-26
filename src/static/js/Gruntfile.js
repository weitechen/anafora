module.exports = function( grunt ) {
    grunt.initConfig( {
        qunit: {
            all: {
                options: {
                    urls: [
                        //'https://verbs.colorado.edu/~wech5560/anafora/anaforaTest/testStableMarriage',]
                        'http://localhost:8000/anaforaTest',]
                }
	    }
        }
    } );
    grunt.loadNpmTasks( "grunt-contrib-qunit" );
};
