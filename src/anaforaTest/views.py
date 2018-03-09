
# Create your views here.
#from django.template import Context, loader
from django.shortcuts import render
from django.conf import settings
from django.views.decorators.csrf import csrf_protect
#from django.utils.encoding import smart_unicode, smart_str
#import codecs
import json
#import os, sys
#import grp
#import pwd
#from django.core.cache import cache
#import traceback

@csrf_protect
def index(request, testFuncName = None):
	contextContent = {'jsPath': 'js/anafora/', 'jsTestPath': 'js/test/', 'jsLibPath': 'js/lib/', 'cssPath': 'css/', 'root_url': settings.ROOT_URL}
	contextContent['js'] = []
	contextContent['js_test'] = []
	contextContent['js_lib'] = ['jquery.min.js', 'qunit/qunit-2.5.0.js']
	contextContent['css'] = ['qunit/qunit-2.5.0.css']

	if testFuncName == "testStableMarriage" or testFuncName == None:
		for jsFile in ["schema.js", "anaforaProject.js", "anaforaObj.js", "anaforaAdjudicationProject.js", "stablePair.js"]:
			if jsFile not in contextContent['js']:
				contextContent['js'].append(jsFile)

		for jsTestFile in ['ansCSVReader.js', 'testStableMarriage.js']:
			if jsTestFile not in contextContent['js_test']:
				contextContent['js_test'].append(jsTestFile)

	if testFuncName == "testAdjudication" or testFuncName == None:
		for jsFile in ["schema.js", "anaforaProject.js", "anaforaObj.js", "anaforaAdjudicationProject.js", "stablePair.js"]:
			if jsFile not in contextContent['js']:
				contextContent['js'].append(jsFile)

		for jsTestFile in ['ansCSVReader.js', 'testAdjudication.js']:
			if jsTestFile not in contextContent['js_test']:
				contextContent['js_test'].append(jsTestFile)

	if testFuncName == "testAnnotateFrame": # or testFuncName == None:
		for jsFile in ["schema.js", "anaforaProject.js", "anaforaObj.js", "anaforaAdjudicationProject.js", "stablePair.js", "annotateFrame.js"]:
			if jsFile not in contextContent['js']:
				contextContent['js'].append(jsFile)

		for jsTestFile in ['ansCSVReader.js', 'testAnnotateFrame.js']:
			if jsTestFile not in contextContent['js_test']:
				contextContent['js_test'].append(jsTestFile)

		for jsLibFile in ['jquery.contextMenu.min.js']:
			if jsLibFile not in contextContent['js_lib']:
				contextContent['js_lib'].append(jsLibFile)

		for cssLibFile in ['jquery.contextMenu/jquery.contextMenu.css']:
			if cssLibFile not in contextContent['css']:
				contextContent['css'].append(cssLibFile)

	return render(request, 'testAnnotate/index.html', contextContent)
