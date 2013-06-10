#!/usr/bin/python2.7
import os, sys
import glob

class AnaforaProjectManager:
	rootPath = ""
	projectList = {}

	@staticmethod
	def getProject():
		if AnaforaProjectManager.projectList == {}:
			for projectName in [pName for pName in os.listdir(AnaforaProjectManager.rootPath) if os.path.isdir(os.path.join(AnaforaProjectManager.rootPath, pName)) and pName[0] != '.']:
				AnaforaProjectManager.projectList[projectName] = []

		return sorted([projectName for projectName in AnaforaProjectManager.projectList])

	@staticmethod
	def getCorpusFromProject(projectName):
		if projectName not in AnaforaProjectManager.projectList:
			AnaforaProjectManager.getProject()

		try:
			if AnaforaProjectManager.projectList[projectName] == []:
				projectPath = os.path.join(AnaforaProjectManager.rootPath, projectName)
				AnaforaProjectManager.projectList[projectName] = [cName for cName in os.listdir(projectPath) if os.path.isdir(os.path.join(projectPath, cName)) and cName[0] != '.']
		except KeyError:
			raise
			
		return sorted(AnaforaProjectManager.projectList[projectName])

	@staticmethod
	def searchAvailableTask(projectName, corpusName, schemaName, annotator, maxNumOfAnnotator = 2):
		newTask = []
		inProgressTask = []
		completedTask = []
		needPreannotation = False

		schemaName = schemaName.replace(".", "-")
		schemaName = schemaName.replace("-Adjudication", "")
		
		corpusPath = os.path.join(AnaforaProjectManager.rootPath, projectName, corpusName)

		needPreannotation = False

		if("Relation" in schemaName):
			needPreannotation = True

		if os.path.isdir(corpusPath) != True:
			raise IOError("project or corpus name error")

		for taskName in [tName for tName in os.listdir(corpusPath) if os.path.isdir(os.path.join(corpusPath, tName)) and tName[0] != '.']:
			taskPath = os.path.join(corpusPath, taskName)
			numOfAnnotatorFile = 0
			hasPreannotation = False
			for projectXMLFileName in [pFileName for pFileName in os.listdir(taskPath) if os.path.isfile(os.path.join(taskPath, pFileName)) and pFileName[0] != '.' and pFileName[-4:] == ".xml"]:
				if "." + annotator + "." in projectXMLFileName and taskName + '.' + schemaName in projectXMLFileName:
					# data file for annotator is exists
					if ".completed.xml" in projectXMLFileName:
						completedTask.append(taskName)
					else:
						inProgressTask.append(taskName)
					break
				elif annotator not in projectXMLFileName and (taskName + '.' + schemaName + "." in projectXMLFileName ) and projectXMLFileName != taskName:
					if taskName + "." + schemaName + ".preannotation." in projectXMLFileName:
						hasPreannotation = True
					else:
						# data file not belong to this annotator
						numOfAnnotatorFile += 1


			if (numOfAnnotatorFile < maxNumOfAnnotator or (numOfAnnotatorFile > 0 and annotator == "gold") or os.path.exists(os.path.join(taskPath, ".nolimit"))) and (needPreannotation != True or hasPreannotation) and taskName not in completedTask and taskName not in inProgressTask:
				newTask.append(taskName)

		inProgressTask = sorted(inProgressTask)
		completedTask = sorted(completedTask)
		newTask = sorted(newTask)
		
		return {"i":inProgressTask, "c":completedTask, "n":newTask}

	@staticmethod
	def searchAvailableAdjudicationTask(projectName, corpusName, schemaName, adjudicator):
		newTask = []
		inProgressTask = []
		completedTask = []

		schemaName = schemaName.replace(".", "-")
		schemaName = schemaName.replace("-Adjudication", "")
		
		corpusPath = os.path.join(AnaforaProjectManager.rootPath, projectName, corpusName)

		for taskName in [tName for tName in os.listdir(corpusPath) if os.path.isdir(os.path.join(corpusPath, tName)) and tName[0] != '.']:
			taskPath = os.path.join(corpusPath, taskName)
			numOfAnnotatorFile = 0
			hasPreannotation = False
			hasOtherAdjudicator = False
			for projectXMLFileName in [pFileName for pFileName in os.listdir(taskPath) if os.path.isfile(os.path.join(taskPath, pFileName)) and pFileName[0] != '.' and pFileName[-4:] == ".xml"]:
				if taskName + '.' + schemaName + '-Adjudication.' in projectXMLFileName and projectXMLFileName[:len(taskName)] == taskName:
					# adjudication file for adjudicator is exists
					if '.' + adjudicator + '.' in projectXMLFileName:
						if ".completed.xml" in projectXMLFileName:
							completedTask.append(taskName)
						else:
							inProgressTask.append(taskName)
						break
					else:
						hasOtherAdjudicator = True

				elif adjudicator not in projectXMLFileName and (taskName + '.' + schemaName +'.' in projectXMLFileName ) and projectXMLFileName[:len(taskName)] == taskName and (".completed.xml" in projectXMLFileName) and projectXMLFileName != taskName and ".preannotation." not in projectXMLFileName:
					# data file not belong to this adjudicator
					numOfAnnotatorFile += 1

			if numOfAnnotatorFile >= 2 and (hasOtherAdjudicator == False or os.path.exists(os.path.join(taskPath, ".nolimit"))) and taskName not in completedTask and taskName not in inProgressTask:
				newTask.append(taskName)

		inProgressTask = sorted(inProgressTask)
		completedTask = sorted(completedTask)
		newTask = sorted(newTask)
		
		return {"i":inProgressTask, "c":completedTask, "n":newTask}

	@staticmethod
	def getCompleteAnnotator(schemaName, projectName, corpusName, taskName):
		schemaName = schemaName.replace(".", "-")

		path = os.path.join(AnaforaProjectManager.rootPath, projectName, corpusName, taskName)
		fileList = glob.glob(path + "/" + taskName + '.' + schemaName + ".*.completed.xml")
		return sorted([term.split("/")[-1].split(".")[-3] for term in fileList])
