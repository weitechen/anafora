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
from projectSetting import *
import subprocess
import json
import os, sys
import grp
import pwd
from django.core.cache import cache

css = ["css/style.css", "css/themes/default/style.css"]

js_lib = ["js/lib/" + js_file for js_file in ["jquery.jstree.js", "jquery.jstree.schema.js", "jquery.hotkeys.js", "jquery.ui.position.js", "jquery.contextMenu.js", "jquery.json-2.4.min.js", "jquery.cookie.js"]]

js_annotate = ["js/annotate/" + js_file for js_file in  ["schema.js", "anaforaProject.js", "anaforaObj.js", "annotate.js", "propertyFrame.js", "annotateFrame.js", "aObjSelectionMenu.js", "projectSelector.js", "anaforaAdjudicationProject.js", "relationFrame.js"]]

js_schemaSpecific = {"Coreference": {"adjudication":["js/annotate/anaforaAdjudicationProjectCoreference.js"]}}

account = ""

grpID = grp.getgrnam(settings.ADMIN_GROUPNAME)[2]
AnaforaProjectManager.rootPath = settings.ANAFORA_PROJECT_FILE_ROOT

projectSetting = None

def index(request, projectName="", corpusName="", taskName="", schema="", schemaMode="", annotatorName=""):

	if request.method != "GET":
		return HttpResponseForbidden()

	if (schemaMode == "Adjudication" or annotatorName != "") and isAdjudicator(request) != True:
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
	ps = getProjectSetting()
	schemaMap = ps.getSchemaMap()
	if annotatorName == "":
		annotatorName = account
	else:
		if ";" not in annotatorName:
			isAdjudication = False
	
	js_schemaSpecific = {"Coreference": {"adjudication":["js/annotate/anaforaAdjudicationProjectCoreference.js"]}}
	contextContent = {
		'js': (js_lib + js_annotate) if settings.DEBUG else (js_lib + ["js/out.js"]) ,
		'js_schemaSpecific': js_schemaSpecific, 
		'css': css,
		'title': taskName + ' - Anafora',
		'rawText': rawText.replace("&", "&amp;").replace("<", "&lt;").replace("\r", "&#13;").replace("\n", "&#10;"),
		'root_url': settings.ROOT_URL,
		'settingVars': {'app_name': "annotate", 'projectName': projectName, 'corpusName': corpusName, 'taskName': taskName, 'schema': schema, 'isAdjudication': isAdjudication, 'annotator': annotatorName, 'remoteUser': request.META["REMOTE_USER"], 'schemaMap': json.dumps( schemaMap )},
	}
	contextContent.update(csrf(request))
	context = Context(contextContent)
	return render(request, 'annotate/index.html', context)

def getCompleteAnnotator(request, projectName, corpusName, taskName, schemaName) :
	if isSchemaExist(schemaName) != True:
		return HttpResponseNotFound("schema file not found")
	if isAdjudicator(request):
		annotatorName = AnaforaProjectManager.getCompleteAnnotator(schemaName, projectName, corpusName, taskName)
		return HttpResponse(json.dumps(annotatorName))

	return HttpResponseForbidden("access not allowed")

def getInprogressAnnotator(request, projectName, corpusName, taskName, schemaName) :
	if isSchemaExist(schemaName) != True:
		return HttpResponseNotFound("schema file not found")
	if isAdjudicator(request):
		annotatorName = AnaforaProjectManager.getInprogressAnnotator(schemaName, projectName, corpusName, taskName)
		return HttpResponse(json.dumps(annotatorName))

	return HttpResponseForbidden("access not allowed")

def getAnnotator(request, projectName, corpusName, taskName, schemaName) :
	"""
	Given project, corpus, taskName and schemaName, return the list of annotator names
	adjudicator permission required
	"""
	if isSchemaExist(schemaName) != True:
		return HttpResponseNotFound("schema file not found")

	if isAdjudicator(request):
		annotatorName = AnaforaProjectManager.getAnnotator(schemaName, projectName, corpusName, taskName)

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

	if annotatorName != "" and annotatorName != request.META["REMOTE_USER"] and isAdjudicator(request) is not True and annotatorName != "preannotation" :
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

	ps = getProjectSetting()
	if schemaIdx==-1:
		schemaIdx = 0
	else:
		schemaIdx = int(schemaIdx)

	try:
		if "." in schema:
			[schema, mode] = schema.split(".")
		else:
			mode = "default"
		(schemaFileName, moreSchema) = ps.getSchemaFileNameFromSchemaAndMode(schema, schemaIdx, mode)

		schemaFile = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, ".schema", schemaFileName)
		fhd = open(schemaFile)
		schemaXML = fhd.read()
		fhd.close()
	except Exception as inst:
		return HttpResponseNotFound(inst)
		

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

def getAllTask(request, projectName, corpusName, schemaName):
	# Given projectName, corpusName, schemaName, return all the available task
	if request.method != "GET":
		return HttpResponseForbidden()

	if isSchemaExist(schemaName) != True:
		return HttpResponseNotFound("schema file not found")

	if isAdjudicator(request):
		taskName = AnaforaProjectManager.searchAllTask(projectName, corpusName, schemaName)
		return HttpResponse(json.dumps(taskName))
	else:
		return HttpResponseForbidden("access not allowed")


def getAdjudicationTaskFromProjectCorpusName(request, projectName, corpusName, schemaName):
	if request.method != "GET":
		return HttpResponseForbidden()

	if isSchemaExist(schemaName) != True:
		return HttpResponseNotFound("schema file not found")
	
	if isAdjudicator(request):
		taskName = AnaforaProjectManager.searchAvailableAdjudicationTask(projectName, corpusName, schemaName, request.META["REMOTE_USER"])
		return HttpResponse(json.dumps(taskName))
	else:
		return HttpResponseForbidden("access not allowed")

def getTaskFromProjectCorpusName(request, projectName, corpusName, schemaName):
	if isSchemaExist(schemaName) != True:
		return HttpResponseNotFound("schema file not found")

	ps = getProjectSetting()
	try:
		taskName = AnaforaProjectManager.searchAvailableTask(projectName, corpusName, schemaName, request.META["REMOTE_USER"], ps)
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

	if "-Adjudication" in schemaName and ".completed.xml" in fileName:
		fileNameGold = fileName.replace("-Adjudication", "").replace("." + request.META["REMOTE_USER"] + ".", ".gold.")
		subprocess.call(["cp", fileName, fileNameGold])
		ps = getProjectSetting()
		schema = ps.getSchema(schemaName.split("-")[0])
		mode = ps.getMode(*(schemaName.replace("-Adjudication", "").split("-")))
		for tMode in schema.modes:
			if tMode.needPreannotation and tMode.preannotationFromMode == mode:
				fileNamePreannotation = filePath + "/" + taskName + "." + schema.name + "-" + tMode.name +  ".preannotation.completed.xml"
				subprocess.call(["cp", fileNameGold, fileNamePreannotation])

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

	ps = getProjectSetting()

	if os.path.exists(fileName + ".inprogress.xml"):
		subprocess.call(["mv", fileName + ".inprogress.xml", fileName + ".completed.xml"])
		subprocess.call("sed -u -i 's/<progress>in-progress<\/progress>/<progress>completed<\/progress>/' " + fileName + ".completed.xml", shell=True)

		if "-Adjudication" in schemaName:
			# set as gold
			fileNameGold = filePath + "/" + taskName + "." + schemaName.replace("-Adjudication", "") +  ".gold.completed.xml"
			subprocess.call(["cp", fileName + ".completed.xml", fileNameGold])
			schema = ps.getSchema(schemaName.split("-")[0])
			mode = ps.getMode(*(schemaName.replace("-Adjudication", "").split("-")))
			for tMode in schema.modes:
				if tMode.needPreannotation and tMode.preannotationFromMode == mode:
					fileNamePreannotation = filePath + "/" + taskName + "." + schema.name + "-" + tMode.name +  ".preannotation.completed.xml"
					subprocess.call(["cp", fileNameGold, fileNamePreannotation])


			
		return HttpResponse()
	else:
		return HttpResponseNotFound("in-progress file not found")

def isSchemaExist(testSchemaName):
	testSchemaName = testSchemaName.replace(".Adjudication", "")

	if testSchemaName.count(".") > 1:
		return False
	elif "." in testSchemaName:
		(schemaName, modeName) = testSchemaName.split('.')
	else:
		schemaName = testSchemaName
		modeName = "default"

	ps = getProjectSetting()
	return ps.isSchemaExist(schemaName, modeName)

def isAdjudicator(request):
	if "REMOTE_ADMIN" in request.META:
			return request.META["REMOTE_ADMIN"]
	else:
		testAdjudicator = request.META["REMOTE_USER"]
		return (grpID in [g.gr_gid for g in grp.getgrall() if testAdjudicator in g.gr_mem])


def getProjectSetting():
	global projectSetting
	if projectSetting != None:
		return projectSetting

	projectSetting = cache.get('anafora_project_setting')
	if projectSetting == None:
		projectSetting = ProjectSetting()
		projectSetting.parseFromFile(os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, settings.ANAFORA_PROJECT_SETTING_FILENAME))
		cache.set('anafora_project_setting', projectSetting)
	
	return projectSetting
