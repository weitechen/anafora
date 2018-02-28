module.exports = function( grunt ) {
    grunt.initConfig( {
        qunit: {
            annotateFrame: {
                options: {
                    urls: [
                        //'https://verbs.colorado.edu/~wech5560/anafora/anaforaTest/testStableMarriage',]
                        'http://localhost:8000/anaforaTest/testAnnotateFrame',]
                }
	    },
	   stableMarriage: {
                options: {
                    urls: [
                        //'https://verbs.colorado.edu/~wech5560/anafora/anaforaTest/testStableMarriage',]
                        'http://localhost:8000/anaforaTest/testStableMarriage',]
                }
	    }
        }
    } );
    grunt.loadNpmTasks( "grunt-contrib-qunit" );
};
