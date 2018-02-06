#!/usr/bin/python2.7
import os, sys
import glob
from projectSetting import *
from taskFile import TaskFile
from django.conf import settings
from django.core.exceptions import ValidationError
from subprocess import call, check_output
import re

class AnaforaProjectManager:
	#rootPath = ""
	projectList = {}
	hasLoadProject = False
	annotatorRE = re.compile(r"^.*\/?[^\/]+\.[^\/\.]+\.([^\/\.]+)\.([^\/\.]+)\.xml")

	@staticmethod
	def getProject(ps):
		"""
		@type ps:	   ProjectSetting
		@rtype:			list of str
		"""
		AnaforaProjectManager.loadProject(ps)

		return sorted(AnaforaProjectManager.projectList.keys())

	@staticmethod
	def getCorpusFromProject(ps, projectName):
		"""
		@type ps:			 ProjectSetting
		@type projectName:  str
		@rtype:				list of str
		"""
		AnaforaProjectManager.checkExist(ps, projectName)
		AnaforaProjectManager.loadCorpus(ps, projectName)

		return AnaforaProjectManager.projectList[projectName]

	@staticmethod
	def loadProject(ps):
		""" Load projectName into projectList
		@type ps		ProjectSetting
		"""
		if AnaforaProjectManager.hasLoadProject == False:
			AnaforaProjectManager.projectList = dict([(str(projectName), None) for projectName in ps.projectList.keys()])
			AnaforaProjectManager.hasLoadProject = True

	@staticmethod
	def loadCorpus(ps, projectName):
		""" Load corpus into projectList[projectName]
		@type ps:		   ProjectSetting
		@type projectName:  str
		"""
		AnaforaProjectManager.checkExist(ps, projectName = projectName)
		if AnaforaProjectManager.projectList[projectName] == None:
			projectPath = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, projectName)
			AnaforaProjectManager.projectList[projectName] = sorted([cName for cName in os.listdir(projectPath) if os.path.isdir(os.path.join(projectPath, cName)) and cName[0] != '.'])

	@staticmethod
	def checkExist(ps, projectName, corpusName = "", taskName=""):
		"""
		@type ps:			ProjectSetting
		@type projectName:	str
		@type corpusName:	str
		@type taskName:		str
		@type schemaName:	str
		@type modeName:		str
		@rtype:bool
		"""
		if AnaforaProjectManager.hasLoadProject == False:
			AnaforaProjectManager.loadProject(ps)

		if projectName not in AnaforaProjectManager.projectList:
			raise Exception("Project '%s' is not exist" % projectName)

		if corpusName == "":
			return True

		if AnaforaProjectManager.projectList[projectName] == None:
			AnaforaProjectManager.loadCorpus(ps, projectName)

		if corpusName not in AnaforaProjectManager.projectList[projectName]:
			raise Exception("Corpus '%s' is not exist under Project '%s'" % (corpusName, projectName))

		if taskName == "":
			return True

		if os.path.isdir(os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, projectName, corpusName, taskName)) != True:
			raise Exception("Task '%s' is not exist under Project '%s' - Corpus '%s'" % (taskName, projectName, corpusName))
		return True

	@staticmethod
	def searchAllTask(ps, projectName, corpusName, schemaName, schemaMode = None, isAdj = False, isCrossDoc = False):
		""" Search all task names which contain target schemaName
		@type ps:			ProjectSetting
		@type projectName:  str
		@type corpusName:   str
		@type schemaName:   str
		@type schemaMode:	str
		@rtype:				list of str
		"""
		AnaforaProjectManager.checkExist(ps, projectName, corpusName)
		mode = ps.getMode(schemaName, schemaMode)

		corpusPath = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, projectName, corpusName)
		command_str = "find %s -maxdepth 2 -type f -name '*.%s%s.*.xml' | sed -r 's/^.*\/([^\/]+)\/[^\/]+.xml$/\\1/g' | sort -u" % (corpusPath, mode.getSchemaName(), "-Adjudication" if isAdj else "")
		taskNameList = check_output(command_str, shell=True)
		taskName = [tName for tName in taskNameList.split('\n') if tName != '']
		return taskName

	@staticmethod
	def getAllTask(ps, projectName, corpusName):
		""" Get all task under $projectName and $corpusName
		@type ps:			ProjectSetting
		@type projectName:  str
		@type corpusName:   str
		@rtype:				list of str
		"""
		AnaforaProjectManager.checkExist(ps, projectName, corpusName)
		corpusPath = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, projectName, corpusName)
		command_str = "find %s -mindepth 1 -maxdepth 1 -type d | sed -r 's/%s\/([^\/]+)$/\\1/g' | sort -u" % (corpusPath, corpusPath.replace("/", "\\/"))
		taskNameList = check_output(command_str, shell=True)
	
		#"find " + AnaforaProjectManager.rootPath + projectName + "/" + corpusName + "/ -type f -name '*." + schemaName + ".*.xml' | sed 's#\(.*\)/\(.*\)/\(.*\)/.*#\\3#' | sort -u", shell=True )
		taskName = [tName for tName in taskNameList.split('\n') if tName != '' and tName[0] != "."]

		return taskName


	@staticmethod
	def getParentTaskFromProjectCorpusName(ps, projectName, corpusName):
		""" Get the task that contain subtask (for cross document annotation only)
		@type ps:		   	ProjectSetting
		@type projectName:	str
		@type corpusName:	str
		@rtype:			  	list of str
		"""
		AnaforaProjectManager.checkExist(ps, projectName, corpusName)
		return AnaforaProjectManager.getAllTask(ps, projectName, corpusName)

	@staticmethod
	def getAllSubTaskFromProjectCorpusTaskName(ps, projectName, corpusName, taskName):
		""" Get the task that contain subtask (for cross document annotation only)
		@type ps:		   ProjectSetting
		@type projectName:  str
		@type corpusName:   str
		@type taskName:	 str
		@rtype:			  list of str
		"""
		AnaforaProjectManager.checkExist(ps, projectName, corpusName, taskName)
		taskPath = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, projectName, corpusName, taskName)
		return sorted([tName for tName in os.listdir(taskPath) if os.path.isdir(os.path.join(taskPath, tName)) and tName[0] != '.' and os.path.isfile(os.path.join(taskPath, tName, tName))])

	@staticmethod
	def searchAvailableCrossTask(ps, projectName, corpusName, annotator, schemaName, modeName = None, maxNumOfAnnotator = 2):
		""" Search available, in-progress, and completed cross-document task for target $annotator
		@type ps:					ProjectSetting
		@type projectNamee:			str
		@type corpusName:			str
		@type annotator:			str
		@type schemaName:			str
		@type modeName:				str
		@type maxNumOfAnnotator:	int
		@rtype:						dict of list of str
		"""
		standardAvailableTasks = AnaforaProjectManager.searchAvailableTask(ps, projectName, corpusName, annotator, schemaName, modeName, needPreannotation = False)
		mode = ps.getMode(schemaName, modeName)
		if mode.needPreannotation:
			newTaskWithPreList = []
			for newTaskName in standardAvailableTasks["n"]:
				subTaskList = AnaforaProjectManager.getAllSubTaskFromProjectCorpusTaskName(ps, projectName, corpusName, newTaskName)
				taskPath = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, projectName, corpusName, newTaskName)
				allHasPreannotation = True if len(subTaskList) > 0 else False
				
				for subTaskName in subTaskList:
					hasPreannotation = False
					subTaskPath = os.path.join(taskPath, subTaskName)
					for projectXMLFileName in [pFileName for pFileName in os.listdir(subTaskPath) if os.path.isfile(os.path.join(subTaskPath, pFileName)) and pFileName[0] != '.' and pFileName[-4:] == ".xml"]:
						try:
							subTaskFile = TaskFile(projectXMLFileName)
						except ValidationError:
							continue
					
						if subTaskFile.taskName == subTaskName and subTaskFile.schemaName == schemaName and subTaskFile.modeName == modeName and subTaskFile.isPreannotation:
							hasPreannotation = True
							break

					if hasPreannotation != True:
						allHasPreannotation = False
						break

				if allHasPreannotation:
					newTaskWithPreList.append(newTaskName)

			standardAvailableTasks["n"] = newTaskWithPreList

		return standardAvailableTasks
				
	@staticmethod
	def searchAvailableTask(ps, projectName, corpusName, annotator, schemaName, modeName = None, maxNumOfAnnotator = 2, needPreannotation = None):
		""" Search available, inProgess, and completed task for target annotator
		@type ps:					ProjectSetting
		@type projectNamee:			str
		@type corpusName:			str
		@type annotator:			str
		@type schemaName:			str
		@type modeName:				str
		@type maxNumOfAnnotator:	int
		@type needPreannotation:	bool
		@rtype:						dict of list of str
		"""
		newTask = []
		inProgressTask = []
		completedTask = []

		#AnaforaProjectManager.checkExist(ps, projectName, corpusName)
		mode = ps.getMode(schemaName, modeName)
		
		corpusPath = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, projectName, corpusName)

		if needPreannotation == None:
			needPreannotation = False
			if mode.needPreannotation:
				#if("Relation" in schemaName):
				needPreannotation = True

		if mode.directSetGold:
			maxNumOfAnnotator = 1

		for taskName in AnaforaProjectManager.getAllTask(ps, projectName, corpusName):
		#for taskName in [tName for tName in os.listdir(corpusPath) if os.path.isdir(os.path.join(corpusPath, tName)) and tName[0] != '.']:
			taskPath = os.path.join(corpusPath, taskName)
			numOfAnnotatorFile = 0
			hasPreannotation = False
			hasGold = False
			hasAdjudication = False
			for projectXMLFileName in [pFileName for pFileName in os.listdir(taskPath) if os.path.isfile(os.path.join(taskPath, pFileName)) and pFileName[0] != '.' and pFileName[-4:] == ".xml"]:
				try:
					taskFile = TaskFile(projectXMLFileName)
				except ValidationError:
					continue
				if taskFile.taskName == taskName and taskFile.schemaName == schemaName and taskFile.modeName == modeName:
				#if "%s.%s.%s" % (taskName, annotator, mode.getSchemaName()) in projectXMLFileName:
				#if "." + annotator + "." in projectXMLFileName and taskName + '.' + schemaName + "." in projectXMLFileName:
					# data file for annotator is exists
					if taskFile.annotator == annotator and taskFile.isAdjudication == False :
						if ".completed.xml" in projectXMLFileName:
					#if taskFile.isCompleted:
							completedTask.append(taskName)
						else:
							inProgressTask.append(taskName)
						break
					else:
						if taskFile.isPreannotation:
							hasPreannotation = True
						elif taskFile.isGold:
							hasGold = True
						elif taskFile.isAdjudication:
							hasAdjudication = True
						else:
							numOfAnnotatorFile += 1

			if (numOfAnnotatorFile < maxNumOfAnnotator or (numOfAnnotatorFile > 0 and annotator == "gold") or (os.path.exists(os.path.join(taskPath, ".nolimit")))) and (needPreannotation != True or hasPreannotation) and (hasGold != True) and (hasAdjudication != True) and taskName not in completedTask and taskName not in inProgressTask and os.path.exists(os.path.join(taskPath, ".noassign")) != True:
				newTask.append(taskName)

		inProgressTask = sorted(inProgressTask)
		completedTask = sorted(completedTask)
		newTask = sorted(newTask)
		
		return {"i":inProgressTask, "c":completedTask, "n":newTask}

	@staticmethod
	def searchAvailableAdjudicationTask(ps, projectName, corpusName, adjudicator, schemaName, modeName = None, maxNumOfAnnotator = 2):
		""" search available adjudication task
		@type ps:			ProjectSetting
		@type projectNam:	str
		@type corpusName:	str
		@type adjudicator:	str
		@type schemaName:	str
		@type modeName:		str
		@type maxNumOfAnnnotator:	int
		@rtype:				dict of list of str
		"""

		newTask = []
		inProgressTask = []
		completedTask = []

		#schemaName = schemaName.replace(".", "-")
		#schemaName = schemaName.replace("-Adjudication", "")
		
		mode = ps.getMode(schemaName, modeName)
		corpusPath = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, projectName, corpusName)

		for taskName in AnaforaProjectManager.getAllTask(ps, projectName, corpusName):
		#for taskName in [tName for tName in os.listdir(corpusPath) if os.path.isdir(os.path.join(corpusPath, tName)) and tName[0] != '.']:
			taskPath = os.path.join(corpusPath, taskName)
			numOfAnnotatorFile = 0
			hasPreannotation = False
			hasOtherAdjudicator = False
			hasGold = False
			for projectXMLFileName in [pFileName for pFileName in os.listdir(taskPath) if os.path.isfile(os.path.join(taskPath, pFileName)) and pFileName[0] != '.' and pFileName[-4:] == ".xml"]:
				try:
					taskFile = TaskFile(projectXMLFileName)
				except ValidationError:
					continue
				if taskFile.taskName == taskName and taskFile.schemaName == schemaName and taskFile.modeName == modeName:
					if taskFile.isAdjudication:
						if taskFile.annotator == adjudicator:
							if taskFile.isCompleted:
								completedTask.append(taskName)
							else:
								inProgressTask.append(taskName)
							break
						else:
							hasOtherAdjudicator = True
					else:
						if taskFile.isGold:
							hasGold = True
						elif taskFile.isPreannotation:
							hasPreannotation = True
						elif taskFile.isCompleted:
							numOfAnnotatorFile += 1

			if numOfAnnotatorFile >= maxNumOfAnnotator and (hasOtherAdjudicator == False or os.path.exists(os.path.join(taskPath, ".nolimit"))) and taskName not in completedTask and taskName not in inProgressTask and (hasGold != True):
				newTask.append(taskName)

		inProgressTask = sorted(inProgressTask)
		completedTask = sorted(completedTask)
		newTask = sorted(newTask)
		
		return {"i":inProgressTask, "c":completedTask, "n":newTask}

	@staticmethod
	def getAnnotator(ps, projectName, corpusName, taskName, schemaName, schemaMode = None, isAdjudication = False):
		"""
		@type ps:			ProjectSetting
		@type projectName:	str
		@type corpusName:	str
		@type taskName:		str
		@type schemaName:	str
		@type schemaMode:	str
		@type isAdjudication:	bool
		@rtype:				dict of list of str
		"""

		#schemaName = schemaName.replace(".", "-")

		annotatorList = {}
		annotatorList["i"] = AnaforaProjectManager.getInprogressAnnotator(ps, projectName, corpusName, taskName, schemaName, schemaMode, isAdjudication)
		annotatorList["c"] = AnaforaProjectManager.getCompletedAnnotator(ps, projectName, corpusName, taskName, schemaName, schemaMode, isAdjudication)
		annotatorList["n"] = []

		return annotatorList

	@staticmethod
	def getInprogressAnnotator(ps, projectName, corpusName, taskName, schemaName, schemaMode = None, isAdjudication = False):
		"""
		@type ps:			ProjectSetting
		@type projectName:	str
		@type corpusName:	str
		@type taskName:		str
		@type schemaName:	str
		@type schemaMode:		str
		@type isAdjudication:	bool
		@rtype:				list of str
		"""
		#schemaName = schemaName.replace(".", "-")
		AnaforaProjectManager.checkExist(ps, projectName, corpusName, taskName)
		mode = ps.getMode(schemaName, schemaMode)

		#taskPath = os.path.join(AnaforaProjectManager.rootPath, projectName, corpusName, taskName)
		fileList = glob.glob(os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, projectName, corpusName, taskName, '%s.%s%s.*.inprogress.xml' % (taskName, mode.getSchemaName(), "-Adjudication" if isAdjudication else "")))
		#fileList = glob.glob(path + "/" + taskName + '.' + schemaName + ".*.inprogress.xml")
		return sorted([annotatorMatcher.group(1) for annotatorMatcher in [re.search(AnaforaProjectManager.annotatorRE, term) for term in fileList] if annotatorMatcher != None])
		#return sorted([term.split("/")[-1].split(".")[-3] for term in fileList])

	@staticmethod
	def getCompletedAnnotator(ps, projectName, corpusName, taskName, schemaName, schemaMode = None, isAdjudication = False):
		"""
		@type ps:			ProjectSetting
		@type projectName:	str
		@type corpusName:	str
		@type taskName:		str
		@type schemaName:	str
		@type schemaMode:		str
		@type isAdjudication:	bool
		@rtype:				list of str
		"""
		#schemaName = schemaName.replace(".", "-")
		AnaforaProjectManager.checkExist(ps, projectName, corpusName, taskName)
		mode = ps.getMode(schemaName, schemaMode)

		path = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, projectName, corpusName, taskName)
		#fileList = glob.glob(path + "/" + taskName + '.' + schemaName + ".*.completed.xml")
		fileList = glob.glob(os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, projectName, corpusName, taskName, '%s.%s%s.*.completed.xml' % (taskName, mode.getSchemaName(), "-Adjudication" if isAdjudication else "")))
		return sorted([annotatorMatcher.group(1) for annotatorMatcher in [re.search(AnaforaProjectManager.annotatorRE, term) for term in fileList] if annotatorMatcher != None])
