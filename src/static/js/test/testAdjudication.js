// Simple Javascript example

console.log('Loading a web page');
var page = require('webpage').create();
//var url = 'https://verbs.colorado.edu/~wech5560/anafora/anafora/THYMEColonFinal/Train/ID185_clinic_543/Thyme2v1.Coreference.Adjudication';
//var url = 'http://phantomjs.org/';
var url = 'http://localhost:8000/anafora/THYMEColonFinal/Train/ID185_clinic_543/Thyme2v1.Coreference.Adjudication';
page.settings.userName = "wtchen";
page.open(url, function (status) {
  console.log(status);
  var title = page.evaluate(function() {
	      return window;
	        });
  Object.keys(title).forEach(function(k) {
	  console.log("'" + k + "': " + title[k]);
	 });
  /*
  var currentAProject = page.evaluate(function() {
	  console.log(window);
	    return window.currentAProject;
  }).then(function() {
	  console.log('a');
	  
  });
  */

  phantom.exit();
});
      
page.onError = function(msg, trace) {

  var msgStack = ['ERROR: ' + msg];

  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
    });
  }

  console.error(msgStack.join('\n'));

};
