# Create your views here.
from django.template import Context, loader
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseForbidden
from django.shortcuts import render
from django.conf import settings
from django.views.decorators.csrf import csrf_protect
from django.utils.encoding import smart_unicode, smart_str
import codecs
from anaforaProjectManager import *
from projectSetting import *
import subprocess
import json
import os, sys
import grp
import pwd
from django.core.cache import cache
import traceback

css = ["css/style.css", "css/themes/default/style.css"]

js_lib = [("js/lib/%s" % js_file) for js_file in ["jquery.min.js", "jquery.jstree.js", "jquery.jstree.schema.js", "jquery.hotkeys.js", "jquery.ui.position.min.js", "jquery.contextMenu.min.js", "jquery.json-2.4.min.js", "jquery.cookie.js"]]

js_anafora = [("js/anafora/%s" % js_file) for js_file in ["errorHandler.js", "schema.js", "anaforaProject.js", "anaforaObj.js", "annotate.js", "propertyFrame.js", "annotateFrame.js", "aObjSelectionMenu.js", "projectSelector.js", "anaforaAdjudicationProject.js", "anaforaCrossProject.js", "anaforaCrossAdjudicationProject.js", "relationFrame.js", "stablePair.js", "eventLogging.js" ]]

js_schemaSpecific = {"Coreference": {"adjudication": ["js/anafora/anaforaAdjudicationProjectCoreference.js"]}}

account = ""

grpID = grp.getgrnam(settings.ADMIN_GROUPNAME)[2]
AnaforaProjectManager.rootPath = settings.ANAFORA_PROJECT_FILE_ROOT

projectSetting = None

basicContextContent = {
	'js': (js_lib + js_anafora) if settings.DEBUG else (js_lib + ["js/out.js"]),
	'js_schemaSpecific': js_schemaSpecific,
	'css': css,
	'title': 'Anafora',
	'rawText': None,
	'ROOT_URL': settings.ROOT_URL,
	'settingVars': None}

def assignSettingVars(request, projectName = None, corpusName = None, taskName = None, schemaName = None, annotator = None, isAdj = False, isCrossDoc = False, isLogging = False):
	""" Assign Setting variables to contextContent
	@type request:		HttpRequest
	@param request:
	@type projectName:	str
	@param projectName:
	@type corpusName:	str
	@param corpusName:
	@type taskName:		str
	@param taskName:
	@type schemaName:	str
	@param schemaName:
	@type remoteUser:	str
	@param remoteUser:
	@type annotator:	str
	@param annotator:
	@type isAdj:		bool
	@param isAdj:
	@type isCrossDoc:	bool
	@param isCrossDoc:
	@param isLogging
	@type isLogging:	bool
	@rtype:				dict
	"""
	ps = getProjectSetting()
	
	rSettings = {'app_name': "anafora", 'annotator': annotator if annotator != None else request.META["REMOTE_USER"] , 'remoteUser': request.META["REMOTE_USER"],'schemaMap': json.dumps(ps.getSchemaMap()), 'isAdjudication': isAdj, 'isCrossDoc': isCrossDoc, 'isLogging': isLogging }
	
	if projectName  != None:
		rSettings['projectName'] = projectName

	if corpusName != None:
		rSettings['corpusName'] = corpusName

	if taskName != None:
		rSettings['taskName'] = taskName

	if schemaName != None:
		rSettings['schema'] = schemaName

	return rSettings

def authenticate(ps, request, projectName = "", corpusName = "", taskName = "", schemaName = "", schemaMode = None, isAdjudication = False, isView = False, isCrossDoc = False):
	"""
	@type ps:	ProjectSetting
	@type request:	HttpRequest
	@type projectName:	str
	@type corpusName:	str
	@type taskName:		str
	@type schemaName:	str
	@type schemaMode:	str
	@type isAdjudication:	bool
	@type isView:		bool
	@type isCrossDoc:	bool
	@rtype:			HttpResponse
	"""

	if isAdjudication:
		#if request.META["REMOTE_ADMIN"] != True:
		if not isAdjudicator(request):
			return HttpResponseForbidden("%s does not have the authenticate right to adjudicate" % request.META["REMOTE_USER"])
	
	if isView:
		if request.META["REMOTE_ADMIN"] != True:
			return HttpResponseForbidden("%s does not have the 'view' right" % request.META["REMOTE_USER"])
	
	if projectName != "":
		if os.path.isdir(os.path.join(AnaforaProjectManager.rootPath, projectName)) != True:
			return HttpResponseForbidden("Project Name: '%s' does not exists" % str(projectName))

	if corpusName != "":
		if os.path.isdir(os.path.join(AnaforaProjectManager.rootPath, projectName, corpusName)) != True:
			return HttpResponseForbidden("Corpus Name: '%s' does not exists" % str(corpusName))
	if taskName != "":
		if os.path.isdir(os.path.join(AnaforaProjectManager.rootPath, projectName, corpusName, taskName)) != True:
			return HttpResponseForbidden("Task Name: '%s' does not exists" % str(taskName))

        if schemaName != "":
        	if isSchemaExist(schemaName, schemaMode) != True:
        		return HttpResponseNotFound("schema file of schema '%s' is not found" % schemaName)

	return None
		

@csrf_protect
def index(request):
	"""
	@type request:		HttpRequest
	@param request:
	@rtype:	HttpResponse
	@return:
	"""
	if request.method != "GET":
		return HttpResponseForbidden()
	
	ps = getProjectSetting()
	authResponse = authenticate(ps, request) 
	if authResponse != None:
		return authResponse

	contextContent = basicContextContent
	contextContent['settingVars'] = assignSettingVars(request)
	# contextContent.update(csrf(request))
	#context = Context(contextContent)
	return render(request, 'anafora/index.html', contextContent)

@csrf_protect
def selectProject(request, projectName):
	if request.method != "GET":
		return HttpResponseForbidden()
	ps = getProjectSetting()
	authResponse = authenticate(ps, request, projectName = projectName) 
	if authResponse != None:
		return authResponse

	contextContent = basicContextContent
	contextContent['settingVars'] = assignSettingVars(request, projectName = projectName)
	# contextContent.update(csrf(request))
	#context = Context(contextContent)
	return render(request, 'anafora/index.html', contextContent)

@csrf_protect
def selectCorpus(request, projectName, corpusName):
	""" select projectName and corpusName only
	@type request:		HttpRequest
	@type projectName:	str
	@type corpusName:	str
	"""
	if request.method != "GET":
		return HttpResponseForbidden()
	ps = getProjectSetting()
	authResponse = authenticate(ps, request, projectName = projectName, corpusName = corpusName) 
	if authResponse != None:
		return authResponse

	contextContent = basicContextContent
	contextContent['settingVars'] = assignSettingVars(request, projectName = projectName, corpusName = corpusName)
	# contextContent.update(csrf(request))
	#context = Context(contextContent)
	return render(request, 'anafora/index.html', contextContent)

@csrf_protect
def annotateNormal(request, projectName, corpusName, taskName, schema, schemaMode=None, view="", crossDoc="", adjudication="", annotator=None, logging=None ):  # annotatorName="", crossDoc=None):
	if request.method != "GET":
		return HttpResponseForbidden()

	account = request.META["REMOTE_USER"]

	isView = False
	isAdjudication = False
	isCrossDoc = False
	annotatorName = account
	isLogging = False

	if view == "view":
		isView = True
	if crossDoc == "_crossDoc":
		isCrossDoc = True
	if adjudication == "Adjudication":
		isAdjudication = True
	if logging == "_logging_":
		isLogging = True
	
	#schemaName = schema if schemaMode != " else ("%s-%s" % (schema, schemaMode))

	ps = getProjectSetting()
	authResponse = authenticate(ps, request, projectName = projectName, corpusName = corpusName, taskName = taskName, schemaName = schema, schemaMode = schemaMode, isAdjudication = isAdjudication, isView = isView, isCrossDoc = isCrossDoc)
	if authResponse != None:
		return authResponse


	ps = getProjectSetting()

	rawTextList = {}

	def readRawText(rawTextFile, taskName):
		rawText = ""
		with open(rawTextFile) as fhd:
			try:
				rawText = fhd.read()
			except:
				raise
		rawTextList[taskName] = rawText.replace("&", "&amp;").replace("<", "&lt;").replace("\r", "&#13;").replace("\n", "&#10;")

	if projectName == "":
		pass
	elif corpusName == "":
		pass
	elif taskName == "":
		pass
	else:
		try:
			if isCrossDoc:
				#rawTextFileList = AnaforaProjectManager.getSubTask(projectName, corpusName, taskName)
				rawTextFileList = AnaforaProjectManager.getAllSubTaskFromProjectCorpusTaskName(ps, projectName, corpusName, taskName)
				for (rawTextFile, sTaskName) in [(os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, projectName, corpusName, taskName, sTaskName, sTaskName), sTaskName) for sTaskName in rawTextFileList]:
					readRawText(rawTextFile, sTaskName )
			else:
				rawTextFile = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, projectName, corpusName, taskName, taskName)
				readRawText(rawTextFile, taskName)
		except:
			raise
			return HttpResponseForbidden("raw text file open error: " + rawTextFile)

	schemaMap = ps.getSchemaMap()
	if annotator == None or annotator == "":
		annotator = account
	#else:
	#	if ";" not in annotatorName:
	#		isAdjudication = False
	

	js_schemaSpecific = {"Coreference": {"adjudication": ["js/anafora/anaforaAdjudicationProjectCoreference.js"]}}
	contextContent = {
		'js': (js_lib + js_anafora) if settings.DEBUG else (js_lib + ["js/out.js"]),
		'js_schemaSpecific': js_schemaSpecific,
		'css': css,
		'title': taskName + ' - Anafora',
		'rawText': sorted(rawTextList.items()),
		'ROOT_URL': settings.ROOT_URL,
		'settingVars': {'app_name': "anafora", 'projectName': projectName, 'corpusName': corpusName,
						'taskName': taskName, 'schema': "%s%s" % (schema, "" if schemaMode== None else (".%s" % schemaMode)), 'isAdjudication': isAdjudication,
						'annotator': annotator, 'remoteUser': request.META["REMOTE_USER"],
						'schemaMap': json.dumps(schemaMap),
						'isCrossDoc': isCrossDoc,
						'isLogging': isLogging},
	}
	# contextContent.update(csrf(request))
	#context = Context(contextContent)
	return render(request, 'anafora/index.html', contextContent)


@csrf_protect
def _annotateNormal(request, projectName="", corpusName="", taskName="", schema="", schemaMode="", isView="", optionVar=""):  # annotatorName="", crossDoc=None):
	""" start a regular annotation

	@type request:			HttpRequest
	"""


def getCompleteAnnotator(request, projectName, corpusName, taskName, schemaName, schemaMode = None, isAdj = None):
	if isSchemaExist(schemaName, schemaMode) != True:
		return HttpResponseNotFound("schema file not found")

	ps = getProjectSetting()
	if isAdjudicator(request):
		annotatorName = AnaforaProjectManager.getCompletedAnnotator(ps, projectName, corpusName, taskName, schemaName, schemaMode)
		return HttpResponse(json.dumps(annotatorName))

	return HttpResponseForbidden("access not allowed")


def getInprogressAnnotator(request, projectName, corpusName, taskName, schemaName, modeName = None):
	if isSchemaExist(schemaName, modeName) != True:
		return HttpResponseNotFound("schema file not found")
	if isAdjudicator(request):
		annotatorName = AnaforaProjectManager.getInprogressAnnotator(schemaName, projectName, corpusName, taskName)
		return HttpResponse(json.dumps(annotatorName))

	return HttpResponseForbidden("access not allowed")


def getAnnotator(request, projectName, corpusName, taskName, schemaName, schemaMode = None, isAdj = None ):
	"""
	Given project, corpus, taskName and schemaName, return the list of annotator names
	adjudicator permission required
	"""
	if isSchemaExist(schemaName, schemaMode) != True:
		return HttpResponseNotFound("schema file not found")

	ps = getProjectSetting()
	if isAdjudicator(request):
		#annotatorName = AnaforaProjectManager.getAnnotator(schemaName, projectName, corpusName, taskName)
		annotatorName = AnaforaProjectManager.getAnnotator(ps, projectName, corpusName, taskName, schemaName, schemaMode = schemaMode, isAdjudication = (isAdj == "Adjudication"))

		return HttpResponse(json.dumps(annotatorName))

	return HttpResponseForbidden("access not allowed")


def getAnaforaXMLFile(request, projectName, corpusName, taskName, schemaName, schemaMode = None, isAdj = None, annotatorName="", subTaskName=""):
	"""
	Given projectName, corpusName, taskName and schema, return the XML data file content

	the default of annotatorName is request.META["REMOTE_USER"]. If annotatorName is assigned, then return this specific annotator's file (annotator permission required) 
	"""

	if request.method != "GET":
		return HttpResponseForbidden()

	if isSchemaExist(schemaName, schemaMode) != True:
		return HttpResponseNotFound("schema file not found")

	#schema = schema.replace(".", "-")

	if annotatorName != "" and annotatorName != request.META["REMOTE_USER"] and isAdjudicator(request) is not True and annotatorName != "preannotation":
		return HttpResponseForbidden("access not allowed")

	account = request.META["REMOTE_USER"] if annotatorName == "" else annotatorName
	anaforaXMLFile = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, projectName, corpusName, taskName)
	if subTaskName == None:
		anaforaXMLFile = os.path.join(anaforaXMLFile, "%s.%s.%s" % (taskName, reduce(lambda a,b: "%s-%s" % (a,b), (schemaName, ) + ((schemaMode,) if schemaMode != None else ()) + (("Adjudication",) if isAdj != None else ())), account))
	else:
		anaforaXMLFile = os.path.join(anaforaXMLFile, subTaskName,  "%s.%s.%s" % (subTaskName, reduce(lambda a,b: "%s-%s" % (a,b), (schemaName, ) + ((schemaMode,) if schemaMode != None else ()) + (("Adjudication",) if isAdj != None else ())), account))

	if os.path.exists("%s.completed.xml" % anaforaXMLFile):
		anaforaXMLFile = "%s.completed.xml" % anaforaXMLFile
	elif os.path.exists("%s.inprogress.xml" % anaforaXMLFile):
		anaforaXMLFile = "%s.inprogress.xml" % anaforaXMLFile
	else:
		return HttpResponseNotFound("file not found")

	anaforaXML = ""
	with open(anaforaXMLFile) as fhd:
		try:
			anaforaXML = fhd.read()
		except:
			raise Exception("Open XML File %s error" % anaforaXMLFile)

	return HttpResponse(anaforaXML)

def getSchema(request, schema, schemaIdx=-1):
	"""
	given schema name, return the first shcema file content

	if schemaIdx is specificed, return the idx-th schema file content
	"""

	if request.method != "GET":
		return HttpResponseForbidden()

	schema = schema.replace(".Adjudication", "")
	moreSchema = False

	ps = getProjectSetting()
	if schemaIdx == -1:
		schemaIdx = 0
	else:
		schemaIdx = int(schemaIdx)

	try:
		if "." in schema:
			[schema, mode] = schema.split(".")
		else:
			mode = None
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

	ps = getProjectSetting()
	return HttpResponse(json.dumps(AnaforaProjectManager.getProject(ps)))


def getCorpusFromProjectName(request, projectName):
	if request.method != "GET":
		return HttpResponseForbidden()

	ps = getProjectSetting()
	try:
		corpusName = AnaforaProjectManager.getCorpusFromProject(ps, projectName)
	except Exception as e:
		return HttpResponseNotFound(str(e))

	return HttpResponse(json.dumps(corpusName))

def getCrossTaskFromProjectCorpusName(request, projectName, corpusName, schemaName, modeName = None):
	""" Given projectName, corpusName, schemaName, return all the available crossDocument Task
	@type request:	HTTPRequest
	@type corpusName:	str
	@type schemaName:	str
	"""
	if request.method != "GET":
		return HttpResponseForbidden()

	if not isSchemaExist(schemaName, modeName):
		return HttpResponseNotFound("schema file not found")

	ps = getProjectSetting()
	try:
		taskName = AnaforaProjectManager.searchAvailableCrossTask(ps, projectName, corpusName, request.META["REMOTE_USER"], schemaName, modeName)
	except Exception as e:
		errorStr = traceback.format_exc()
		return HttpResponseNotFound(errorStr)

	return HttpResponse(json.dumps(taskName))

@csrf_protect
def getAllTask(request, projectName, corpusName, schemaName, schemaMode = None, isAdj=None, crossDoc=""):
	"""Given projectName, corpusName, schemaName, return all the available task
	@type request:		HttpRequest
	@type projectName:	str
	@type corpusName:	str
	@type schemaName:	str
	@type schemaMode:	str
	@type adjudication:	str
	@type crossDoc:		str
	@rtype:				list of str
	"""
	if request.method != "GET":
		return HttpResponseForbidden()

	if isSchemaExist(schemaName, schemaMode) != True:
		return HttpResponseNotFound("schema file not found")

	ps = getProjectSetting()
	if isAdjudicator(request):
		taskName = AnaforaProjectManager.searchAllTask(ps, projectName, corpusName, schemaName, schemaMode = schemaMode, isAdj = (isAdj == "Adjudication") , isCrossDoc = (crossDoc == "_crossDoc") )
		return HttpResponse(json.dumps(taskName))
	else:
		return HttpResponseForbidden("access not allowed")


def getAdjudicationTaskFromProjectCorpusName(request, projectName, corpusName, schemaName, schemaMode = None, crossDoc=None):
	if request.method != "GET":
		return HttpResponseForbidden()

	if isSchemaExist(schemaName, schemaMode) != True:
		return HttpResponseNotFound("schema file not found")

	ps = getProjectSetting()
	if isAdjudicator(request):
		taskName = AnaforaProjectManager.searchAvailableAdjudicationTask(ps, projectName, corpusName, request.META["REMOTE_USER"], schemaName, schemaMode)
		return HttpResponse(json.dumps(taskName))
	else:
		return HttpResponseForbidden("access not allowed")

def getParentTaskFromProjectCorpusName(request, projectName, corpusName):
	""" For cross document only
	@type request:		HttpRequest
	@type projectName:	str
	@type corpusName:	str
	@rtype:				list of str
	"""

	if isSchemaExist(schemaName, schemaMode) != True:
		return HttpResponseNotFound("schema file not found")

def getSubTaskFromProjectCorpusTaskName(request, projectName, corpusName, parentTaskName):
	""" Return sub task name
		@type request:			HttpRequest
		@type projectName:		str
		@type corpusName:		str
		@type parentTaskName:	str
	"""

	if request.method != "GET":
		return HttpResponseForbidden()

	ps = getProjectSetting()
	try:
		subTaskName = AnaforaProjectManager.getAllSubTaskFromProjectCorpusTaskName(ps, projectName, corpusName, parentTaskName)
	except Exception as e:
		return HttpResponseNotFound(str(e))

	return HttpResponse(json.dumps(subTaskName))

def getTaskFromProjectCorpusName(request, projectName, corpusName, schemaName, schemaMode = None, crossDoc=False):

	ps = getProjectSetting()
	try:
		if crossDoc:
			return getCrossTaskFromProjectCorpusName(request, projectName, corpusName, schemaName, schemaMode)
			#taskName = AnaforaProjectManager.searchAvailableCrossTask(projectName, corpusName, schemaName, request.META["REMOTE_USER"], ps)
		else:
			taskName = AnaforaProjectManager.searchAvailableTask(ps, projectName, corpusName, request.META["REMOTE_USER"], schemaName, schemaMode)
	except Exception as e:
		errorStr = traceback.format_exc()
		return HttpResponseNotFound(errorStr)
		#return HttpResponseNotFound(str(e))

	return HttpResponse(json.dumps(taskName))


def writeFile(request, projectName, corpusName, taskName, schemaName, schemaMode = None, isAdj = None):
	if request.method != "POST":
		return HttpResponseForbidden()

	if isSchemaExist(schemaName, schemaMode) != True:
		return HttpResponseNotFound("schema file not found")

	filePath = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, projectName, corpusName, taskName)

	if os.path.exists(filePath) != True:
		return HttpResponseNotFound("project, corpus or task not found")

	fileContent = request.POST.get("fileContent")
	fileName = os.path.join(filePath, "%s.%s%s%s.%s" %  (taskName,  schemaName, "" if schemaMode == None else "-%s" % schemaMode, "" if isAdj == None else "-Adjudication",  (request.META["REMOTE_USER"])))
	if os.path.exists(fileName + ".completed.xml"):
		fileName = fileName + ".completed.xml"
	else:
		fileName = fileName + ".inprogress.xml"

	with codecs.open(fileName, "w+", "utf-8") as fhd:
		fhd.write(fileContent)

	if isAdj != None and ".completed.xml" in fileName:
		fileNameGold = fileName.replace("-Adjudication", "").replace("." + request.META["REMOTE_USER"] + ".", ".gold.")
		subprocess.call(["cp", fileName, fileNameGold])
		ps = getProjectSetting()
		schema = ps.getSchema(schemaName.split("-")[0])
		mode = ps.getMode(*(schemaName.replace("-Adjudication", "").split("-")))
		for tMode in schema.modes:
			if tMode.needPreannotation and tMode.preannotationFromMode == mode:
				fileNamePreannotation = filePath + "/" + taskName + "." + schema.name + "-" + tMode.name + ".preannotation.completed.xml"
				subprocess.call(["cp", fileNameGold, fileNamePreannotation])

	return HttpResponse()

def saveLogging(request,projectName, corpusName, taskName, schemaName, schemaMode = None, isAdj = None): 
	if request.method != "POST":
		return HttpResponseForbidden()

	if isSchemaExist(schemaName, schemaMode) != True:
		return HttpResponseNotFound("schema file not found")

	filePath = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, projectName, corpusName, taskName)

	if os.path.exists(filePath) != True:
		return HttpResponseNotFound("project, corpus or task not found")

	logContent = request.POST.get("logContent")
	fileName = os.path.join(filePath, "%s.%s%s%s.%s.log" %  (taskName,  schemaName, "" if schemaMode == None else "-%s" % schemaMode, "" if isAdj == None else "-Adjudication",  (request.META["REMOTE_USER"])))

	with open(fileName, "a+") as fhd:
		fhd.write(logContent)
	
	return HttpResponse()

def setCompleted(request, projectName, corpusName, taskName, schemaName, schemaMode = None, isAdj = None):
	if request.method != "POST":
		return HttpResponseForbidden()

	if isSchemaExist(schemaName, schemaMode) != True:
		return HttpResponseNotFound("schema file not found")

	filePath = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, projectName, corpusName, taskName)

	if os.path.exists(filePath) != True:
		return HttpResponseNotFound("project, corpus or task not found")

	fileName = os.path.join(filePath, "%s.%s%s%s.%s" % (taskName, schemaName, "" if schemaMode == None else "-%s" % schemaMode, "" if isAdj == None else "-Adjudication", request.META["REMOTE_USER"]))

	ps = getProjectSetting()

	if os.path.exists("%s.inprogress.xml" % fileName):
		subprocess.call(["mv", "%s.inprogress.xml" % fileName , "%s.completed.xml" % fileName])
		subprocess.call(
			"sed -u -i 's/<progress>in-progress<\/progress>/<progress>completed<\/progress>/' %s.completed.xml" % (fileName),
			shell=True)
		#subprocess.call(
		#	"sed -u -i 's/@%s/@gold/' %s.completed.xml" % (request.META["REMOTE_USER"], fileName),
		#	shell=True)
		#mode = ps.getMode(*(schemaName.replace("-Adjudication", "").split("-")))
		mode = ps.getMode(schemaName, schemaMode)
		if isAdj is not None or mode.directSetGold:
			# set as gold
			if mode.directSetGold:
				subprocess.call("sed -u -i 's/@%s/@gold/' %s.completed.xml" % (request.META["REMOTE_USER"], fileName), shell=True)
			fileNameGold = filePath + "/" + taskName + "." + schemaName + ("" if schemaMode == None else ("-" + schemaMode)) +  ".gold.completed.xml"
			subprocess.call(["cp", fileName + ".completed.xml", fileNameGold])
			schema = ps.getSchema(schemaName)
			for tModeName in schema.modes:
				tMode = ps.getMode(schemaName, tModeName)
				if tMode.needPreannotation and tMode.preannotationFromMode is not None and tMode.preannotationFromMode.name == mode.name:
					fileNamePreannotation = filePath + "/" + taskName + "." + schema.name + "-" + tMode.name +  ".preannotation.completed.xml"
					subprocess.call(["cp", fileNameGold, fileNamePreannotation])

		return HttpResponse()
	else:
		return HttpResponseNotFound("in-progress '%s.inprogress.xml' file not found" % fileName)


def isSchemaExist(schemaName, modeName = None):
	#testSchemaName = testSchemaName.replace(".Adjudication", "")

	#if testSchemaName.count(".") > 1:
	#	return False
	if "." in schemaName:
		(schemaName, modeName) = schemaName.split('.')
	#else:
	#	schemaName = testSchemaName
	#	modeName = "default"

	ps = getProjectSetting()
	return ps.isSchemaExist(schemaName, modeName)


def isAdjudicator(request):
	#return request.META["REMOTE_ADMIN"]
	if "REMOTE_ADMIN" in request.META:
		return request.META["REMOTE_ADMIN"]
	else:
		testAdjudicator = request.META["REMOTE_USER"]
		return (grpID in [g.gr_gid for g in grp.getgrall() if testAdjudicator in g.gr_mem])


def getProjectSetting():
	"""
	@rtype:	ProjectSetting
	"""
	global projectSetting
	if projectSetting != None:
		return projectSetting

	projectSetting = cache.get('anafora_project_setting')
	if projectSetting == None:
		parseFile = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, settings.ANAFORA_PROJECT_SETTING_FILENAME)
		if os.path.isfile(parseFile) != True:
			from django.core.exceptions import ImpoperlyConfigured
			raise ImproperlyConfigured, "Error loading ANAFORA_PROJECT_SETTING_FILENAME in web/settings.py file. Please check the value of ANAFORA_PROJECT_FILE_ROOT, ANAFORA_PROJECT_SETTING_FILENAME accordingly"
		projectSetting = ProjectSetting()
		projectSetting.parseFromFile(parseFile)
		cache.set('anafora_project_setting', projectSetting)

	return projectSetting
