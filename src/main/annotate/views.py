# Create your views here.
from django.template import Context, loader
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseForbidden
from django.shortcuts import render
from django.conf import settings
from django.core.context_processors import csrf
from django.utils.encoding import smart_unicode, smart_str
import codecs
#from Anafora.anaforaProjectManager import AnaforaProjectManager
from anaforaProjectManager import *
import subprocess
import json
import os, sys
import grp
import pwd

css = ["style.css", "themes/default/style.css"]
js = ["lib/jquery.jstree.js", "lib/jquery.jstree.schema.js", "lib/jquery.hotkeys.js", "lib/jquery.ui.position.js", "lib/jquery.contextMenu.js", "lib/jquery.json-2.4.min.js", "lib/jquery.cookie.js", "annotate/schema.js", "annotate/anaforaProject.js", "annotate/anaforaObj.js", "annotate/annotate.js", "annotate/propertyFrame.js", "annotate/annotateFrame.js", "annotate/aObjSelectionMenu.js", "annotate/projectSelector.js", "annotate/anaforaAdjudicationProject.js", "annotate/relationFrame.js"]
account = ""
# schemaMap variable give Anafora the schema hierarchy. The first level if the schema name. If there is mode in that schema, create another level. Then put the schema file name in the directory. If there is multiple files for one schema, put them in the list. Order DOES matter.
# example:  schemaMap = {"Schema_1": {"Mode_1":["Schema_1-schema.xml", "Schema_1_1-schema.xml"], "Mode_2":["Shcmea_1-schema.xml", "Schema_1_1-schema.xml"]}, "Schema_2": ["Schema_2-schema.xml"]}
schemaMap = {}

grpID = grp.getgrnam('anaforaadmin')[2]
AnaforaProjectManager.rootPath = settings.ANAFORA_PROJECT_FILE_ROOT

def index(request, projectName="", corpusName="", taskName="", schema="", schemaMode="", annotatorName=""):

	if request.method != "GET":
		return HttpResponseForbidden()

	if (schemaMode == "Adjudication" or annotatorName != "") and isAdjudicator(request.META["REMOTE_USER"]) != True:
		return HttpResponseForbidden("access not allowed")

	if (schema != ""):
		if isSchemaExist(schema) != True:
			return HttpResponseNotFound("schema file not found")

	isAdjudication = False

	if (schemaMode == "Adjudication"):
		isAdjudication = True
		
	rawText = ""

	if projectName == "":
		pass
	elif corpusName == "":
		pass
	elif  taskName == "":
		pass
	else:
		try:
			rawTextFile = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, projectName, corpusName, taskName, taskName)
			fhd = open(rawTextFile)
			rawText = fhd.read()
			fhd.close()
		except:
			return HttpResponseForbidden("raw text file open error: " + rawTextFile)
			

	account = request.META["REMOTE_USER"]
	if annotatorName == "":
		annotatorName = account
	else:
		isAdjudication = False

	contextContent = {
		'js': js,
		'css': css,
		'title': taskName + ' - Anafora',
		'rawText': rawText.replace("&", "&amp;").replace("<", "&lt;"),
		'root_url': settings.ROOT_URL,
		'settingVars': {'app_name': "annotate", 'projectName': projectName, 'corpusName': corpusName, 'taskName': taskName, 'schema': schema, 'isAdjudication': isAdjudication, 'annotator': annotatorName, 'remoteUser': request.META["REMOTE_USER"], 'schemaMap': json.dumps( dict(zip(schemaMap.keys(), [0 if isinstance(schemaMap[pName], list) else schemaMap[pName].keys() for pName in schemaMap])))},
	}
	contextContent.update(csrf(request))
	context = Context(contextContent)
	return render(request, 'annotate/index.html', context)

def getAnnotator(request, projectName, corpusName, taskName, schemaName) :
	"""
	Given project, corpus, taskName and schemaName, return the list of annotator names
	adjudicator permission required
	"""
	if isSchemaExist(schemaName) != True:
		return HttpResponseNotFound("schema file not found")

	if isAdjudicator(request.META["REMOTE_USER"]):
		annotatorName = AnaforaProjectManager.getCompleteAnnotator(schemaName, projectName, corpusName, taskName)

		return HttpResponse(json.dumps(annotatorName))

	return HttpResponseForbidden("access not allowed")
	
def getAnaforaXMLFile(request, projectName, corpusName, taskName, schema, annotatorName = ""):
	"""
	Given projectName, corpusName, taskName and schema, return the XML data file content

	the default of annotatorName is request.META["REMOTE_USER"]. If annotatorName is assigned, then return this specific annotator's file (annotator permission required) 
	"""

	if request.method != "GET":
		return HttpResponseForbidden()

	if isSchemaExist(schema) != True:
		return HttpResponseNotFound("schema file not found")

	schema = schema.replace(".", "-")

	if annotatorName != "" and isAdjudicator(request.META["REMOTE_USER"]) is not True and annotatorName != "preannotation" :
		return HttpResponseForbidden("access not allowed")

	account = request.META["REMOTE_USER"] if annotatorName == "" else annotatorName
	anaforaXMLFile = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, projectName, corpusName, taskName, taskName + "." + schema + "." + account)
	anaforaXML = ""

	if os.path.exists(anaforaXMLFile + ".completed.xml"):
		anaforaXMLFile = anaforaXMLFile + ".completed.xml"
	elif os.path.exists(anaforaXMLFile + ".inprogress.xml"):
		anaforaXMLFile = anaforaXMLFile + ".inprogress.xml"
	else:
		return HttpResponseNotFound("file not found")

	fhd = open(anaforaXMLFile)
	anaforaXML = fhd.read()
	fhd.close()

	return HttpResponse(anaforaXML)

def getSchema(request, schema, schemaIdx=-1 ):
	"""
	given schema name, return the first shcema file content

	if schemaIdx is specificed, return the idx-th schema file content
	"""

	if request.method != "GET":
		return HttpResponseForbidden()

	schema = schema.replace(".Adjudication", "")
	moreSchema = False

	if schemaIdx==-1:
		schemaIdx = 0
	else:
		schemaIdx = int(schemaIdx)

	try:
		if "." in schema:
			[schema, mode] = schema.split(".")
			schemaFileName = schemaMap[schema][mode][schemaIdx]
			if schemaIdx < len(schemaMap[schema][mode])-1:
				moreSchema = True
		else:
			schemaFileName = schemaMap[schema][schemaIdx]
			if schemaIdx < len(schemaMap[schema])-1:
				moreSchema = True

		schemaFile = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, ".schema", schemaFileName)
		fhd = open(schemaFile)
		schemaXML = fhd.read()
		fhd.close()
	except:
		return HttpResponseNotFound("file not found")

	rJSON = {"moreSchema": moreSchema, "schemaXML": schemaXML}
	
	return HttpResponse(json.dumps(rJSON))

def getProject(request):
	if request.method != "GET":
		return HttpResponseForbidden()
	
	return HttpResponse(json.dumps(AnaforaProjectManager.getProject()))

def getCorpusFromProjectName(request, projectName):
	
	if request.method != "GET":
		return HttpResponseForbidden()

	try:
		corpusName = AnaforaProjectManager.getCorpusFromProject(projectName)
	except:
		return HttpResponseNotFound("corpus not found")
	
	return HttpResponse(json.dumps(corpusName))

def getAdjudicationTaskFromProjectCorpusName(request, projectName, corpusName, schemaName):
	if request.method != "GET":
		return HttpResponseForbidden()

	if isSchemaExist(schemaName) != True:
		return HttpResponseNotFound("schema file not found")
	
	if isAdjudicator(request.META["REMOTE_USER"]):
		taskName = AnaforaProjectManager.searchAvailableAdjudicationTask(projectName, corpusName, schemaName, request.META["REMOTE_USER"])
		return HttpResponse(json.dumps(taskName))
	else:
		return HttpResponseForbidden("access not allowed")

def getTaskFromProjectCorpusName(request, projectName, corpusName, schemaName):

	if isSchemaExist(schemaName) != True:
		return HttpResponseNotFound("schema file not found")

	try:
		taskName = AnaforaProjectManager.searchAvailableTask(projectName, corpusName, schemaName, request.META["REMOTE_USER"])
	except:
		return HttpResponseNotFound("project or corpus not found")

	return HttpResponse(json.dumps(taskName))

def writeFile(request, projectName, corpusName, taskName, schemaName):
	if request.method != "POST":
		return HttpResponseForbidden()

	if isSchemaExist(schemaName) != True:
		return HttpResponseNotFound("schema file not found")

	schemaName = schemaName.replace(".", "-")

	filePath = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, projectName, corpusName, taskName)

	if os.path.exists(filePath) != True:
		return HttpResponseNotFound("project, corpus or task not found")
		
	
	fileContent = request.REQUEST["fileContent"]
	fileName = filePath + "/" + taskName + "." + schemaName + "." + (request.META["REMOTE_USER"])
	if os.path.exists(fileName + ".completed.xml"):
		fileName = fileName + ".completed.xml"
	else:
		fileName = fileName + ".inprogress.xml"

	fhd = codecs.open(fileName, "w+", "utf-8")
	fhd.write(fileContent)
	fhd.close()

	return HttpResponse()
	
def setCompleted(request, projectName, corpusName, taskName, schemaName):
	if request.method != "POST":
		return HttpResponseForbidden()

	if isSchemaExist(schemaName) != True:
		return HttpResponseNotFound("schema file not found")

	schemaName = schemaName.replace(".", "-")

	filePath = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, projectName, corpusName, taskName)

	if os.path.exists(filePath) != True:
		return HttpResponseNotFound("project, corpus or task not found")
		
	fileName = filePath + "/" +  taskName + "." + schemaName + "." + (request.META["REMOTE_USER"])

	if os.path.exists(fileName + ".inprogress.xml"):
		subprocess.call(["mv", fileName + ".inprogress.xml", fileName + ".completed.xml"])
		subprocess.call("sed -u -i 's/<progress>in-progress<\/progress>/<progress>completed<\/progress>/' " + fileName + ".completed.xml", shell=True)
		return HttpResponse()
	else:
		return HttpResponseNotFound("in-progress file not found")

def isSchemaExist(testSchemaName):
	testSchemaName = testSchemaName.replace(".Adjudication", "")
	if "." in testSchemaName:
		term = testSchemaName.split('.')
		if term[0] not in schemaMap or isinstance(schemaMap[term[0]], dict) != True or term[1] not in schemaMap[term[0]] or len(term) > 2:
			return False
	else:
		if testSchemaName not in schemaMap or isinstance(schemaMap[testSchemaName], dict):
			return False

	return True

def isAdjudicator(testAdjudicator):
	return (grpID in [g.gr_gid for g in grp.getgrall() if testAdjudicator in g.gr_mem])
