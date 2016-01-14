#!/usr/bin/python2.7
import sys

from xml.dom.minidom import parseString

class ProjectSetting():
	def __init__(self):
		self.projectList = {}
		self.schemaList = {}

	def parseFromFile(self, filePath):
		fhd = open(filePath)
		psXMLStr = reduce(lambda x,y: x+' '+y, fhd.xreadlines())
		fhd.close()
		psDOM = parseString(psXMLStr).childNodes[0]

		if psDOM.tagName != "setting":
			raise Exception("Project Setting XML Dom parse error: " + psDOM.toxml())

		for childNode in [tNode for tNode in psDOM.childNodes if tNode.nodeType == tNode.ELEMENT_NODE]:
			if childNode.tagName == "projects":
				for projectNode in [tNode for tNode in childNode.childNodes if tNode.nodeType == tNode.ELEMENT_NODE]:
					project = Project.parseFromXMLDOM(projectNode)
					self.projectList[project.name] = project
			elif childNode.tagName == "schemas":
				for schemaNode in [tNode for tNode in childNode.childNodes if tNode.nodeType == tNode.ELEMENT_NODE]:
					schema = Schema.parseFromXMLDOM(schemaNode)
					self.schemaList[schema.name] = schema
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
			for mode in schema.modes:
				if mode.name == "default":
					pass
				else:
					if mode.needPreannotation:
						if mode.preannotationFromMode not in [tMode.name for tMode in schema.modes]:
							raise Exception('Preannotation mode name "' + str(mode.preannotationFromMode) + '" from mode "' + mode.name + '" of schema "' + schemaName + '" is not exists')

						mode.preannotationFromMode = [tMode for tMode in schema.modes if tMode.name ==  mode.preannotationFromMode][0]

	def isSchemaExist(self, schemaName, modeName = "default"):
		if schemaName not in self.schemaList:
			return False

		if modeName not in [tMode.name for tMode in self.schemaList[schemaName].modes]:
			return False

		return True

	def getSchemaFileNameFromSchemaAndMode(self, schemaName, schemaFileIdx = 0, modeName="default"):
		needMoreSchema = False
		if schemaName not in self.schemaList:
			raise Exception('Schema "' + str(schemaName) + '" is not exists')

		tModeList = [tMode for tMode in self.schemaList[schemaName].modes if tMode.name == modeName]
		if len(tModeList) == 0:
			raise Exception('Mode "' + str(modeName) + '" is not exists in schema "' + str(schema) + '"')

		mode = tModeList[0]

		if schemaFileIdx >= len(mode.schemaFile):
			raise Exception("The schema Index " + str(schemaFileIdx) + " is more than the size of schema files")

		if schemaFileIdx+1 < len(mode.schemaFile):
			needMoreSchema = True

		return (mode.schemaFile[schemaFileIdx], needMoreSchema)

	def getMode(self, schemaName, modeName = "default"):
		if "-Adjudication" in schemaName:
			schemaName = schemaName.replace("-Adjudication", "")

		if "-" in schemaName:
			(schemaName, modeName) = schemaName.split("-")

		try:
			schema = self.getSchema(schemaName)
			mode = schema.getMode(modeName)
		except Exception as e:
			raise Exception("get mode error!")

		return mode

	def getSchema(self, schemaName):
		if "-Adjudication" in schemaName:
			schemaName = schemaName.replace("-Adjudication", "")

		if "-" in schemaName:
			(schemaName, modeName) = schemaName.split("-")

		try:
			schema = self.schemaList[schemaName]
		except:
			raise Exception

		return schema

	def getSchemaMap(self):
		rSchemaMap = {}
		for schemaName in self.schemaList:
			modeList = [tMode.name for tMode in self.schemaList[schemaName].modes]

			if "default" in modeList:
				if len(modeList) == 1:
					rSchemaMap[schemaName] = 0
				else:
					raise Exception('Schema "' + schemaName + '" has multiple mode name within the "default" mode')
			else:
				rSchemaMap[schemaName] = modeList

		return rSchemaMap

class Schema():
	def __init__(self, name, modes = []):
		self.name = name
		self.modes = modes
	
	@classmethod
	def parseFromXMLDOM(cls, schemaNode):
		if schemaNode.tagName != "schema":
			raise Exception('schema xml DOM parse error: ' + schemaNode.toxml())
		name = schemaNode.getAttribute("name")
		if name == "":
			raise Exception("'name' attribute is not exist in mode xml" + schemaNode.toxml())

		modesList = []

		mode = None
		for childNode in [tNode for tNode in schemaNode.childNodes if tNode.nodeType == tNode.ELEMENT_NODE]:
			if childNode.tagName == "mode":
				mode = Mode.parseFromXMLDOM(childNode)
				modesList.append(mode)
			elif childNode.tagName == "file":
				if mode == None:
					mode = Mode("default", False, None, [])

				mode.addSchemaFile(childNode.childNodes[0].nodeValue)
			else:
				raise Exception("unhandle tag: " + childNode.tagName)

		if mode.name == "default":
			if len(modesList) > 0:
				raise Exception("default mode and multiple modes are exist at the same time: "+ schemaNode.toxml())
			modesList.append(mode)

		return cls(name, modesList)

	def getMode(self, modeName):
		mode = [tMode for tMode in self.modes if tMode.name == modeName][0]
		return mode

class Mode():
	def __init__(self, name, needPreannotation = False, preannotationFromMode = None, schemaFile = [], directSetGold = False):
		self.name = name
		self.needPreannotation = needPreannotation
		self.preannotationFromMode = preannotationFromMode
		self.directSetGold = directSetGold
		self.schemaFile = schemaFile
	
	def addSchemaFile(self, newSchemaFile):
		self.schemaFile.append(newSchemaFile)

	@classmethod
	def parseFromXMLDOM(cls, modeNode):
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

		return cls(name, isPreannotation, preannotationFromMode, schemaFileList, directSetGold)

class Project():
	def __init__(self, name, admins ,  numOfAnnotator = 2, annotators = [], allowedSchemas = []):
		self.name = name
		self.admins = admins
		self.numOfAnnotator = numOfAnnotator
		self.annotators = annotators
		self.allowedSchemas = allowedSchemas
		
	@classmethod
	def parseFromXMLDOM(cls, projectNode):
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
