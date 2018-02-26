
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
	contextContent = {'jsPath': 'js/anafora/', 'jsTestPath': 'js/test/', 'root_url': settings.ROOT_URL}
	if testFuncName == "testStableMarriage" or testFuncName == None:
		contextContent['js'] = ["schema.js", "anaforaProject.js", "anaforaObj.js", "anaforaAdjudicationProject.js", "stablePair.js"]
		contextContent['js_test'] = ['testStableMarriage.js']

	return render(request, 'testAnnotate/index.html', contextContent)
