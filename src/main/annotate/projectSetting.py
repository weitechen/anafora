#!/usr/bin/python2.7
import sys, os

from xml.dom.minidom import parseString, Element
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
import itertools

class ProjectSetting(object):
	def __init__(self):
		"""
		@type projectList:  dict of Project
		@type schemaList:   dict of Schema
		"""
		self.projectList = {}
		self.schemaList = {}

	def parseFromFile(self, filePath):
		""" parse setting XML file
		@type filePath:		 str
		"""
		try:
			with open(filePath) as fhd:
				psXMLStr = reduce(lambda x,y: x+' '+y, fhd.xreadlines())
		except IOError as e:
			raise ImproperlyConfigured, "Can not find setting file '%s', please check your setting of ``ANAFORA_PROJECT_FILE_ROOT'' and ``ANAFORA_PROJECT_SETTING_FILENAME'' in your setting file" % (filePath)
		psDOM = parseString(psXMLStr).childNodes[0]
		if psDOM.tagName != "setting":
			raise Exception("Project Setting XML Dom parse error: " + psDOM.toxml())

		for childNode in [tNode for tNode in psDOM.childNodes if tNode.nodeType == tNode.ELEMENT_NODE]:
			if childNode.tagName == "projects":
				for projectNode in [tNode for tNode in childNode.childNodes if tNode.nodeType == tNode.ELEMENT_NODE]:
					project = Project.parseFromXMLDOM(projectNode)
					if os.path.isdir(os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, project.name)):
						self.projectList[project.name] = project
			elif childNode.tagName == "schemas":
				for schemaNode in [tNode for tNode in childNode.childNodes if tNode.nodeType == tNode.ELEMENT_NODE]:
					schema = Schema.parseFromXMLDOM(schemaNode)
					self.schemaList[str(schema.name)] = schema
			else:
				raise Exception("unhandle tag: " + childNode.tagName)

		#link schema in project
		for projectName in self.projectList:
			project = self.projectList[projectName]
			for (idx, schemaName) in enumerate(project.allowedSchemas):
				if isinstance(schemaName, Schema):
					pass
				else:
					if schemaName not in self.schemaList:
						raise Exception('schema name "' + str(schemaName) + '" in project "' + projectName + '" is not exist')
					project.allowedSchemas[idx] = self.schemaList[schemaName]

		#link preannotationFromMode in schema
		for schemaName in self.schemaList:
			schema = self.schemaList[schemaName]
			for modeName in schema.modes:
				mode = schema.modes[modeName]

				if mode.needPreannotation:
					#if mode.preannotationFromMode not in schema.modes:
					#	raise Exception('Preannotation mode name "' + str(mode.preannotationFromMode) + '" from mode "' + mode.name + '" of schema "' + schemaName + '" is not exists')
					if mode.preannotationFromMode.strip() == "":
						mode.preannotationFromMode = None
					else:
						mode.preannotationFromMode = schema.getMode(mode.preannotationFromMode)

	def isSchemaExist(self, schemaName, modeName = None):
		""" check schema exists
		@type schemaName:	   str
		@type modeName:		 str
		@rtype:				 bool
		"""
		if schemaName not in self.schemaList:
			return False

		if modeName not in self.schemaList[schemaName].modes:
			return False
		
		return True

	def getSchemaFileNameFromSchemaAndMode(self, schemaName, schemaFileIdx = 0, modeName=None):
		"""
		@type schemaName:	   str
		@type schemaFileIdx:	int
		@type modeName:		 str
		@rtype:				 str
		"""
		needMoreSchema = False
		try:
				mode = self.getMode(schemaName, modeName)
		except:
				raise

		if schemaFileIdx >= len(mode.schemaFile):
			raise Exception("The schema '%s' " % (schemaName) + ("" if modeName == None else "with mode name '%s' " % modeName) + "of file index " + str(schemaFileIdx) + " is more than the size of schema files")

		if schemaFileIdx+1 < len(mode.schemaFile):
			needMoreSchema = True

		return (mode.schemaFile[schemaFileIdx], needMoreSchema)

	def getMode(self, schemaName, modeName = None):
		"""
		@type schemaName:	 str
		@type modeName:		 str
		@rtype:				 Mode
		"""

		try:
			schema = self.getSchema(schemaName)
			mode = schema.getMode(modeName)
		except:
			raise

		return mode

	def getSchema(self, schemaName):
		"""
		@type schemaName:	   str
		@rtype:				 Schema
		"""
		try:
			return self.schemaList[schemaName]
		except KeyError:
			raise Exception("Get schema '%s' error" % schemaName)
		except:
			raise

		return schema

	def getSchemaMap(self):
		""" generate the schema map dict
		@rtype:		 dict
		"""
		rSchemaMap = {}
		for schemaName in self.schemaList:
			modeList = [str(tKey) for tKey in self.schemaList[schemaName].modes.keys()]

			if len(modeList) == 1 and None in self.schemaList[schemaName].modes:
				rSchemaMap[schemaName] = 0
			else:
				rSchemaMap[schemaName] = modeList

		return rSchemaMap

class Schema(object):
	def __init__(self, name, modes = {}):
		"""
		@type name:	 str
		@type modes:	dict
		"""
		self.name = name
		self.modes = modes
	
	@classmethod
	def parseFromXMLDOM(cls, schemaNode):
		"""
		@type schemaNode:   Element
		@rtype:		 Schema
		"""
		if schemaNode.tagName != "schema":
			raise Exception('schema xml DOM parse error: ' + schemaNode.toxml())
		name = schemaNode.getAttribute("name")
		if name == "":
			raise Exception("'name' attribute is not exist in mode xml" + schemaNode.toxml())

		modesList = []

		mode = None
		for childNode in [tNode for tNode in schemaNode.childNodes if tNode.nodeType == tNode.ELEMENT_NODE]:
			if childNode.tagName == "mode":
				mode = Mode.parseFromXMLDOM(childNode, name)
				modesList.append((mode.name, mode))
			elif childNode.tagName == "file":
				if mode == None:
					mode = Mode(None, name, False, None, [])

				mode.addSchemaFile(childNode.childNodes[0].nodeValue)
			else:
				raise Exception("unhandle tag: " + childNode.tagName)

		modesDict = None

		if mode.name == None:
			if len(modesList) > 0:
				raise Exception("default mode and multiple modes are exist at the same time: "+ schemaNode.toxml())
			modesDict = {None: mode}
		else:
			modesDict = dict(modesList)

		return cls(name, modesDict)

	def getMode(self, modeName = None):
		""" getmode from mode name
		@type modeName: str
		@rtype:	 Mode
		"""
		if modeName not in self.modes:
			if modeName == None:
				raise Exception("Get schema '%s' error" % self.name)
			else:
				raise Exception("Get schema '%s' with mode name '%s' error" % (self.name, str(modeName)))
		return self.modes.get(modeName)

class Mode(object):
	def __init__(self, name, schema, needPreannotation = False, preannotationFromMode = None, schemaFile = [], directSetGold = False):
		"""
		@type name:					str
		@type schema:				str
		@type needPreannotation:	bool
		@type preannotationFromNode:Mode
		@type schemaFile:			list of str
		@type directSetGold:		bool
		"""
		self.name = name
		self.needPreannotation = needPreannotation
		self.preannotationFromMode = preannotationFromMode
		self.directSetGold = directSetGold
		self.schemaFile = schemaFile
		self.schema = schema
	
	def getSchemaName(self):
		"""
		@rtype: str
		"""
		if self.name == None:
			return self.schema

		return '%s-%s' % (self.schema, self.name)

	def addSchemaFile(self, newSchemaFile):
		""" Add new schema file to the file list
		@type newSchemaFile:	str
		"""
		self.schemaFile.append(newSchemaFile)

	@classmethod
	def parseFromXMLDOM(cls, modeNode, schemaName):
		"""
		@type modeNode: Element
		@rtype:	 Mode
		"""
		
		if modeNode.tagName != "mode":
			raise Exception('mode xml DOM parse error: ' + modeNode.toxml())
		name = modeNode.getAttribute("name")
		if name == "":
			raise Exception("'name' attribute is not exist in mode xml" + modeNode.toxml())

		isPreannotation = (modeNode.getAttribute("preannotation").lower() == "true")
		preannotationFromMode = None
		if isPreannotation:
			preannotationFromMode = modeNode.getAttribute("preannotationFrom")
		directSetGold = (modeNode.getAttribute("directSetGold").lower() == "true")
		schemaFileList = []
		for childNode in [tNode for tNode in modeNode.childNodes if tNode.nodeType == tNode.ELEMENT_NODE]:
			if childNode.tagName == "file":
				schemaFileList.append(childNode.childNodes[0].nodeValue)
			else:
				raise Exception("unhandle tag: " + childNode.tagName)

		return cls(name, schemaName, isPreannotation, preannotationFromMode, schemaFileList, directSetGold)

class Project(object):
	def __init__(self, name, admins ,  numOfAnnotator = 2, annotators = [], allowedSchemas = []):
		"""
		@type name:		 str
		@type admins:	   list of str
		@type numOfAnnotator:   int
		@type annotators:	   list of str
		@type allowedSchemas:   list of str
		"""
		self.name = name
		self.admins = admins
		self.numOfAnnotator = numOfAnnotator
		self.annotators = annotators
		self.allowedSchemas = allowedSchemas
		
	@classmethod
	def parseFromXMLDOM(cls, projectNode):
		"""
		@type projectNode:	Element
		@type:			Project
		"""
		if projectNode.tagName != "project":
			raise Exception('project xml DOM parse error: ' + projectNode.toxml())

		name = projectNode.getAttribute("name")
		if name == "":
			raise Exception("'name' attribute not exist in project xml " + projectNode.toxml())

		numOfAnnotatorStr = projectNode.getAttribute("numOfAnnotator")
		numOfAnnotator = 2
		try:
			numOfAnnotator = int(numOfAnnotatorStr)
		except ValueError:
			pass

		admins = []
		annotators = []
		schemas = []
		for childNode in [tNode for tNode in projectNode.childNodes if tNode.nodeType == tNode.ELEMENT_NODE]:
			if childNode.tagName == "admin":
				admins.append(childNode.childNodes[0].nodeValue)
			elif childNode.tagName == "annotator":
				annotators.append(childNode.childNodes[0].nodeValue)
			elif childNode.tagName == "schema":
				schemas.append(childNode.childNodes[0].nodeValue)
			else:
				raise Exception("unhandle tag: " + childNode.tagName)

		return cls(name, admins, numOfAnnotator, annotators, schemas)

if __name__ == "__main__":

	if len(sys.argv) < 2:
		print 'Please validate the XML file with "python projectSetting.py pathToSettingFile"'
		exit()
	
	try:
		ps = ProjectSetting()
		ps.parseFromFile(sys.argv[1])
	except:
		raise

	print 'Validation Success'
