#!/usr/bin/env python
import os
from unittest import TestCase
from django.conf import settings
from anaforaProjectManager import AnaforaProjectManager
from projectSetting import Schema, Mode, Project, ProjectSetting

class AnaforaProjectManagerTest(TestCase):
	def setUp(self):
		self.ps = ProjectSetting()
		self.ps.parseFromFile(os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, settings.ANAFORA_PROJECT_SETTING_FILENAME))

	def test_getProject(self):
		projectList = AnaforaProjectManager.getProject(self.ps)
		self.assertListEqual(projectList, sorted(["Demo","EventWorkshop", "Temporal", "CrossDocument"]))

		self.assertListEqual(sorted(AnaforaProjectManager.projectList.keys()), sorted(["Demo","EventWorkshop", "Temporal", "CrossDocument"]))
		self.assertEqual(len(AnaforaProjectManager.projectList), 4)

	def test_getCorpusFromProject(self):
		self.assertRaisesRegexp(Exception, "Project 'FakeProject' is not exist", AnaforaProjectManager.getCorpusFromProject, self.ps, "FakeProject")
		corpusList0 = AnaforaProjectManager.getCorpusFromProject(self.ps, "Temporal")
		self.assertListEqual(corpusList0, ["BrainCancer", "ColonCancer"])
		self.assertListEqual(AnaforaProjectManager.projectList["Temporal"], ["BrainCancer", "ColonCancer"])

		self.assertRaisesRegexp(Exception, "Project 'FakeProject' is not exist", AnaforaProjectManager.getCorpusFromProject, self.ps, "FakeProject")
		corpusList1 = AnaforaProjectManager.getCorpusFromProject(self.ps, "CrossDocument")
		self.assertListEqual(corpusList1, ["ColonCancer"])
		self.assertListEqual(AnaforaProjectManager.projectList["Temporal"], ["BrainCancer", "ColonCancer"])
		self.assertListEqual(AnaforaProjectManager.projectList["CrossDocument"], ["ColonCancer"])

		self.assertRaisesRegexp(Exception, "Project 'FakeProject' is not exist", AnaforaProjectManager.getCorpusFromProject, self.ps, "FakeProject")

	def test_loadProject(self):
		AnaforaProjectManager.projectList = {}
		AnaforaProjectManager.hasLoadProject = False
		AnaforaProjectManager.loadProject(self.ps)

		self.assertListEqual(sorted(AnaforaProjectManager.projectList.keys()), sorted(["Demo","EventWorkshop", "Temporal", "CrossDocument"]))

	def test_loadCorpus(self):
		AnaforaProjectManager.projectList = {}
		AnaforaProjectManager.hasLoadProject = False

		self.assertRaisesRegexp(Exception, "Project 'FakeProject' is not exist", AnaforaProjectManager.loadCorpus, self.ps, "FakeProject")
		AnaforaProjectManager.loadCorpus(self.ps, "Temporal")
		self.assertListEqual(AnaforaProjectManager.projectList["Temporal"], ["BrainCancer", "ColonCancer"])
		corpusList1 = AnaforaProjectManager.getCorpusFromProject(self.ps, "Temporal")
		self.assertListEqual(corpusList1, ["BrainCancer", "ColonCancer"])
		self.assertListEqual(AnaforaProjectManager.projectList["Temporal"], ["BrainCancer", "ColonCancer"])

	def test_checkExist(self):
		AnaforaProjectManager.projectList = {}
		AnaforaProjectManager.hasLoadProject = False
		self.assertRaisesRegexp(Exception, "Project 'FakeProject' is not exist", AnaforaProjectManager.checkExist, self.ps, "FakeProject")
		self.assertTrue(AnaforaProjectManager.checkExist(self.ps, "Temporal"))

		AnaforaProjectManager.projectList = {}
		AnaforaProjectManager.hasLoadProject = False
		self.assertTrue(AnaforaProjectManager.checkExist(self.ps, "Temporal"))
		self.assertRaisesRegexp(Exception, "Project 'FakeProject' is not exist", AnaforaProjectManager.checkExist, self.ps, "FakeProject")

		AnaforaProjectManager.projectList = {}
		AnaforaProjectManager.hasLoadProject = False
		self.assertRaisesRegexp(Exception, "Project 'FakeProject' is not exist", AnaforaProjectManager.checkExist, self.ps, "FakeProject", 'FakeCorpus')
		self.assertRaisesRegexp(Exception, "Corpus 'FakeCorpus' is not exist under Project 'Temporal'", AnaforaProjectManager.checkExist, self.ps, "Temporal", 'FakeCorpus')
		self.assertTrue(AnaforaProjectManager.checkExist(self.ps, "Temporal", "ColonCancer"))

		AnaforaProjectManager.projectList = {}
		AnaforaProjectManager.hasLoadProject = False
		self.assertRaisesRegexp(Exception, "Project 'FakeProject' is not exist", AnaforaProjectManager.checkExist, self.ps, "FakeProject", 'FakeCorpus')
		self.assertTrue(AnaforaProjectManager.checkExist(self.ps, "Temporal", "ColonCancer"))
		self.assertRaisesRegexp(Exception, "Corpus 'FakeCorpus' is not exist under Project 'Temporal'", AnaforaProjectManager.checkExist, self.ps, "Temporal", 'FakeCorpus')

		AnaforaProjectManager.projectList = {}
		AnaforaProjectManager.hasLoadProject = False
		self.assertTrue(AnaforaProjectManager.checkExist(self.ps, "Temporal", "ColonCancer"))
		self.assertRaisesRegexp(Exception, "Project 'FakeProject' is not exist", AnaforaProjectManager.checkExist, self.ps, "FakeProject", 'FakeCorpus')
		self.assertRaisesRegexp(Exception, "Corpus 'FakeCorpus' is not exist under Project 'Temporal'", AnaforaProjectManager.checkExist, self.ps, "Temporal", 'FakeCorpus')

		AnaforaProjectManager.projectList = {}
		AnaforaProjectManager.hasLoadProject = False
		self.assertRaisesRegexp(Exception, "Project 'FakeProject' is not exist", AnaforaProjectManager.checkExist, self.ps, "FakeProject", 'FakeCorpus', 'FakeTask')
		self.assertRaisesRegexp(Exception, "Corpus 'FakeCorpus' is not exist under Project 'Temporal'", AnaforaProjectManager.checkExist, self.ps, "Temporal", 'FakeCorpus', 'FakeTask')
		self.assertRaisesRegexp(Exception, "Task 'FakeTask' is not exist under Project 'Temporal' - Corpus 'ColonCancer'", AnaforaProjectManager.checkExist, self.ps, "Temporal", 'ColonCancer', 'FakeTask')
		self.assertTrue(AnaforaProjectManager.checkExist(self.ps, "Temporal", 'ColonCancer', "ID064_clinic_190"))

	def test_searchAllTask(self):
		self.assertRaisesRegexp(Exception, "Project 'FakeProject' is not exist", AnaforaProjectManager.searchAllTask, self.ps, "FakeProject", 'FakeCorpus', 'FakeSchema')
		self.assertRaisesRegexp(Exception, "Corpus 'FakeCorpus' is not exist under Project 'Temporal'", AnaforaProjectManager.searchAllTask, self.ps, "Temporal", 'FakeCorpus', 'FakeSchema')
		self.assertRaisesRegexp(Exception, "Get schema 'Temporal' error", AnaforaProjectManager.searchAllTask, self.ps, "Temporal", 'ColonCancer', 'Temporal')
		taskList0 = AnaforaProjectManager.searchAllTask(self.ps, "Temporal", "ColonCancer", "Temporal", modeName="Entity")
		self.assertListEqual(taskList0, ["ID060_clinic_176", "ID060_clinic_178", "ID061_clinic_179", "ID061_clinic_181", "ID061_path_180a", "ID062_clinic_182", "ID062_path_183", "ID063_clinic_187", "ID063_path_186a", "ID064_clinic_188", "ID064_path_189", "ID065_clinic_191", "ID065_clinic_193", "ID065_path_192", "ID066_clinic_194", "ID066_clinic_196", "ID066_path_195", "ID067_clinic_197", "ID067_clinic_199", "ID067_path_198", "ID068_clinic_200", "ID068_clinic_202", "ID068_path_201", "ID069_clinic_203", "ID069_clinic_205", "ID069_path_204"])

	def test_getAllTask(self):
		self.assertRaisesRegexp(Exception, "Project 'FakeProject' is not exist", AnaforaProjectManager.getAllTask, self.ps, "FakeProject", 'FakeCorpus')
		self.assertRaisesRegexp(Exception, "Corpus 'FakeCorpus' is not exist under Project 'Temporal'", AnaforaProjectManager.getAllTask, self.ps, "Temporal", 'FakeCorpus')
		taskList0 = AnaforaProjectManager.getAllTask(self.ps, "Temporal", "ColonCancer")
		self.assertListEqual(taskList0, sorted(["ID065_path_192", "ID062_clinic_182", "ID062_path_183", "ID069_clinic_205", "ID064_clinic_188", "ID061_path_180a", "ID060_clinic_176", "ID068_path_201", "ID068_clinic_200", "ID068_clinic_202", "ID063_clinic_187", "ID069_clinic_203", "ID067_clinic_197", "ID065_clinic_191", "ID062_clinic_184", "ID066_clinic_196", "ID061_clinic_181", "ID064_path_189", "ID060_path_177", "ID060_clinic_178", "ID063_clinic_185", "ID067_clinic_199", "ID067_path_198", "ID063_path_186a", "ID065_clinic_193", "ID069_path_204", "ID061_clinic_179", "ID066_path_195", "ID066_clinic_194", "ID064_clinic_190"]))
	
	def test_getParentTaskFromProjectCorpusName(self):
		self.assertRaisesRegexp(Exception, "Project 'FakeProject' is not exist", AnaforaProjectManager.getParentTaskFromProjectCorpusName, self.ps, "FakeProject", 'FakeCorpus')
		self.assertRaisesRegexp(Exception, "Corpus 'FakeCorpus' is not exist under Project 'CrossDocument'", AnaforaProjectManager.getParentTaskFromProjectCorpusName, self.ps, "CrossDocument", 'FakeCorpus')
		self.assertListEqual(AnaforaProjectManager.getParentTaskFromProjectCorpusName(self.ps, "CrossDocument", 'ColonCancer'), sorted(['ID017', 'ID025', 'ID035', 'sample-3-982-540']))
	
	def test_getAllSubTaskFromProjectCorpusTaskName(self):
		self.assertRaisesRegexp(Exception, "Project 'FakeProject' is not exist", AnaforaProjectManager.getAllSubTaskFromProjectCorpusTaskName, self.ps, "FakeProject", 'FakeCorpus', 'FakeSchema')
		self.assertRaisesRegexp(Exception, "Corpus 'FakeCorpus' is not exist under Project 'Temporal'", AnaforaProjectManager.getAllSubTaskFromProjectCorpusTaskName, self.ps, "Temporal", 'FakeCorpus', 'FakeSchema')
		self.assertRaisesRegexp(Exception, "Task 'FakeTask' is not exist under Project 'CrossDocument' - Corpus 'ColonCancer'", AnaforaProjectManager.getInprogressAnnotator, self.ps, "CrossDocument", 'ColonCancer', 'FakeTask', 'Temporal', 'Entity')
		subTaskList0 = AnaforaProjectManager.getAllSubTaskFromProjectCorpusTaskName(self.ps, "CrossDocument", "ColonCancer", "ID017")
		self.assertListEqual(subTaskList0, sorted(["ID017_clinic_049", "ID017_clinic_051", "ID017_path_050a" ]))


	def test_searchAvailableTask(self):
		self.assertRaisesRegexp(Exception, "Project 'FakeProject' is not exist", AnaforaProjectManager.searchAvailableTask, self.ps, "FakeProject", 'FakeCorpus', 'wtchen', 'Temporal', 'Entity')
		self.assertRaisesRegexp(Exception, "Corpus 'FakeCorpus' is not exist under Project 'CrossDocument'", AnaforaProjectManager.searchAvailableTask, self.ps, "CrossDocument", 'FakeCorpus', 'wtchen', 'Temporal', 'Entity')
		self.assertRaisesRegexp(Exception, "Get schema 'Temporal' error", AnaforaProjectManager.searchAvailableTask, self.ps, "Temporal", 'ColonCancer', 'wtchen', 'Temporal')

		# === Temporal-Entity ===
		dict0 = AnaforaProjectManager.searchAvailableTask(self.ps, 'Temporal', 'ColonCancer', 'wtchen', 'Temporal', modeName='Entity')
		self.assertListEqual(sorted(dict0.keys()), sorted(['i', 'c', 'n']))
		self.assertListEqual(dict0['i'], sorted(["ID061_path_180a", "ID062_clinic_182", "ID063_path_186a"]))
		self.assertListEqual(dict0['c'], sorted(["ID063_clinic_187", "ID062_path_183"]))
		self.assertListEqual(dict0['n'], sorted(["ID060_path_177", "ID061_clinic_179", "ID062_clinic_184", "ID063_clinic_185", "ID066_clinic_194"]))

		# === Temporal-Relation ===
		dict1 = AnaforaProjectManager.searchAvailableTask(self.ps, 'Temporal', 'ColonCancer', 'wtchen', 'Temporal', modeName='Relation')
		self.assertListEqual(sorted(dict1.keys()), sorted(['i', 'c', 'n']))
		self.assertListEqual(dict1['i'], sorted(["ID062_clinic_184", "ID062_path_183", "ID063_clinic_187"]))
		self.assertListEqual(dict1['c'], sorted(["ID061_clinic_181", "ID061_path_180a", "ID062_clinic_182"]))
		self.assertListEqual(dict1['n'], sorted(["ID060_clinic_176", "ID060_clinic_178", "ID066_clinic_196"]))

		# === Coreference ===
		dict2 = AnaforaProjectManager.searchAvailableTask(self.ps, 'Temporal', 'ColonCancer', 'wtchen', 'Coreference')
		self.assertListEqual(sorted(dict2.keys()), sorted(['i', 'c', 'n']))
		self.assertListEqual(dict2['i'], sorted(["ID061_clinic_179"]))
		self.assertListEqual(dict2['c'], sorted(["ID060_path_177"]))
		self.assertListEqual(dict2['n'], sorted(["ID060_clinic_176", "ID060_clinic_178", "ID063_clinic_185"]))
	
	def test_searchAvailableAdjudicationTask(self):
		self.assertRaisesRegexp(Exception, "Project 'FakeProject' is not exist", AnaforaProjectManager.searchAvailableAdjudicationTask, self.ps, "FakeProject", 'FakeCorpus', 'wtchen', 'Temporal', 'Entity')
		self.assertRaisesRegexp(Exception, "Corpus 'FakeCorpus' is not exist under Project 'CrossDocument'", AnaforaProjectManager.searchAvailableAdjudicationTask, self.ps, "CrossDocument", 'FakeCorpus', 'wtchen', 'Temporal', 'Entity')
		self.assertRaisesRegexp(Exception, "Get schema 'Temporal' error", AnaforaProjectManager.searchAvailableAdjudicationTask, self.ps, "CrossDocument", 'ColonCancer', 'wtchen', 'Temporal')

		# === Temporal-Entity ===
		dict0 = AnaforaProjectManager.searchAvailableAdjudicationTask(self.ps, 'Temporal', 'ColonCancer', 'wtchen', 'Temporal', 'Entity')
		self.assertListEqual(sorted(dict0.keys()), sorted(['i', 'c', 'n']))
		self.assertListEqual(dict0['i'], sorted(["ID068_clinic_202"]))
		self.assertListEqual(dict0['c'], sorted(["ID068_clinic_200"]))
		self.assertListEqual(dict0['n'], sorted(["ID061_clinic_181", "ID062_path_183", "ID063_path_186a", "ID066_clinic_194"]))

	def test_searchAvailableCrossTask(self):
		self.assertRaisesRegexp(Exception, "Project 'FakeProject' is not exist", AnaforaProjectManager.searchAvailableCrossTask, self.ps, "FakeProject", 'FakeCorpus', 'wtchen', 'Temporal', 'Entity')
		self.assertRaisesRegexp(Exception, "Corpus 'FakeCorpus' is not exist under Project 'CrossDocument'", AnaforaProjectManager.searchAvailableCrossTask, self.ps, "CrossDocument", 'FakeCorpus', 'wtchen', 'Temporal', 'Entity')
		self.assertRaisesRegexp(Exception, "Get schema 'Temporal' error", AnaforaProjectManager.searchAvailableCrossTask, self.ps, "CrossDocument", 'ColonCancer', 'wtchen', 'Temporal')

		availableCrossTask = AnaforaProjectManager.searchAvailableCrossTask(self.ps, "CrossDocument", "ColonCancer", "wtchen", "CrossCoreference", "Coref")
		self.assertListEqual(sorted(availableCrossTask.keys()), sorted(["i", "n", "c"]))
		self.assertListEqual(availableCrossTask["i"], sorted(["ID017"]))
		self.assertListEqual(availableCrossTask["n"], sorted(["ID025"]))
		self.assertListEqual(availableCrossTask["c"], sorted(["sample-3-982-540"]))

		availableCrossTask = AnaforaProjectManager.searchAvailableCrossTask(self.ps, "CrossDocument", "ColonCancer", "wtchen", "CrossTemporal", "Entity")
		self.assertListEqual(sorted(availableCrossTask.keys()), sorted(["i", "n", "c"]))
		self.assertListEqual(availableCrossTask["i"], sorted([]))
		self.assertListEqual(availableCrossTask["n"], sorted(["ID017"]))
		self.assertListEqual(availableCrossTask["c"], sorted(["ID035", "sample-3-982-540"]))


	def test_getInprogressAnnotator(self):
		self.assertRaisesRegexp(Exception, "Project 'FakeProject' is not exist", AnaforaProjectManager.getInprogressAnnotator, self.ps, "FakeProject", 'FakeCorpus', 'FakeTask', 'Temporal', 'Entity')
		self.assertRaisesRegexp(Exception, "Corpus 'FakeCorpus' is not exist under Project 'CrossDocument'", AnaforaProjectManager.getInprogressAnnotator, self.ps, "CrossDocument", 'FakeCorpus', 'FakeTask', 'Temporal', 'Entity')
		self.assertRaisesRegexp(Exception, "Task 'FakeTask' is not exist under Project 'CrossDocument' - Corpus 'ColonCancer'", AnaforaProjectManager.getInprogressAnnotator, self.ps, "CrossDocument", 'ColonCancer', 'FakeTask', 'Temporal', 'Entity')
		self.assertRaisesRegexp(Exception, "Get schema 'Temporal' error", AnaforaProjectManager.getInprogressAnnotator, self.ps, "CrossDocument", 'ColonCancer', 'ID017', 'Temporal')

		annotatorList = AnaforaProjectManager.getInprogressAnnotator(self.ps, "Temporal", "ColonCancer", "ID062_clinic_182", "Temporal", "Entity")
		self.assertListEqual(annotatorList, sorted(["wtchen"]))
		annotatorList = AnaforaProjectManager.getInprogressAnnotator(self.ps, "Temporal", "ColonCancer", "ID061_path_180a", "Temporal", "Entity")
		self.assertListEqual(annotatorList, sorted(["wtchen"]))
		annotatorList = AnaforaProjectManager.getInprogressAnnotator(self.ps, "Temporal", "ColonCancer", "ID063_path_186a", "Temporal", "Entity")
		self.assertListEqual(annotatorList, sorted(["wtchen"]))
		
		annotatorList = AnaforaProjectManager.getInprogressAnnotator(self.ps, "Temporal", "ColonCancer", "ID062_path_183", "Temporal", "Entity")
		self.assertListEqual(annotatorList, sorted([]))

		annotatorList = AnaforaProjectManager.getInprogressAnnotator(self.ps, "Temporal", "ColonCancer", "ID068_clinic_202", "Temporal", "Entity", True)
		self.assertListEqual(annotatorList, sorted(["wtchen"]))
		annotatorList = AnaforaProjectManager.getInprogressAnnotator(self.ps, "Temporal", "ColonCancer", "ID062_path_183", "Temporal", "Entity", True)
		self.assertListEqual(annotatorList, sorted([]))

	def test_getCompletedAnnotator(self):
		self.assertRaisesRegexp(Exception, "Project 'FakeProject' is not exist", AnaforaProjectManager.getCompletedAnnotator, self.ps, "FakeProject", 'FakeCorpus', 'FakeTask', 'Temporal', 'Entity')
		self.assertRaisesRegexp(Exception, "Corpus 'FakeCorpus' is not exist under Project 'CrossDocument'", AnaforaProjectManager.getCompletedAnnotator, self.ps, "CrossDocument", 'FakeCorpus', 'FakeTask', 'Temporal', 'Entity')
		self.assertRaisesRegexp(Exception, "Task 'FakeTask' is not exist under Project 'CrossDocument' - Corpus 'ColonCancer'", AnaforaProjectManager.getCompletedAnnotator, self.ps, "CrossDocument", 'ColonCancer', 'FakeTask', 'Temporal', 'Entity')
		self.assertRaisesRegexp(Exception, "Get schema 'Temporal' error", AnaforaProjectManager.getCompletedAnnotator, self.ps, "CrossDocument", 'ColonCancer', 'ID017', 'Temporal')

		annotatorList = AnaforaProjectManager.getCompletedAnnotator(self.ps, "Temporal", "ColonCancer", "ID062_clinic_182", "Temporal", "Entity")
		self.assertListEqual(annotatorList, sorted(["lapoinar"]))
		annotatorList = AnaforaProjectManager.getCompletedAnnotator(self.ps, "Temporal", "ColonCancer", "ID061_path_180a", "Temporal", "Entity")
		self.assertListEqual(annotatorList, sorted([]))
		annotatorList = AnaforaProjectManager.getCompletedAnnotator(self.ps, "Temporal", "ColonCancer", "ID063_path_186a", "Temporal", "Entity")
		self.assertListEqual(annotatorList, sorted(["krwr4334", "lapoinar"]))

		annotatorList = AnaforaProjectManager.getCompletedAnnotator(self.ps, "Temporal", "ColonCancer", "ID065_path_192", "Temporal", "Entity", True)
		self.assertListEqual(annotatorList, sorted(["jegr2781"]))

		annotatorList = AnaforaProjectManager.getCompletedAnnotator(self.ps, "Temporal", "ColonCancer", "ID068_clinic_202", "Temporal", "Entity", True)
		self.assertListEqual(annotatorList, sorted([]))
	
	def test_getAnnotator(self):
		self.assertRaisesRegexp(Exception, "Project 'FakeProject' is not exist", AnaforaProjectManager.getAnnotator, self.ps, "FakeProject", 'FakeCorpus', 'FakeTask', 'Temporal', 'Entity')
		self.assertRaisesRegexp(Exception, "Corpus 'FakeCorpus' is not exist under Project 'CrossDocument'", AnaforaProjectManager.getAnnotator, self.ps, "CrossDocument", 'FakeCorpus', 'FakeTask', 'Temporal', 'Entity')
		self.assertRaisesRegexp(Exception, "Task 'FakeTask' is not exist under Project 'CrossDocument' - Corpus 'ColonCancer'", AnaforaProjectManager.getAnnotator, self.ps, "CrossDocument", 'ColonCancer', 'FakeTask', 'Temporal', 'Entity')
		self.assertRaisesRegexp(Exception, "Get schema 'Temporal' error", AnaforaProjectManager.getAnnotator, self.ps, "Temporal", 'ColonCancer', 'ID065_path_192', 'Temporal')

		annotatorDict = AnaforaProjectManager.getAnnotator(self.ps, "Temporal", "ColonCancer", "ID062_clinic_182", "Temporal", "Entity")
		self.assertListEqual(sorted(annotatorDict.keys()), sorted(["i", "n", "c"]))
		self.assertListEqual(annotatorDict["c"], sorted(["lapoinar"]))
		self.assertListEqual(annotatorDict["i"], sorted(["wtchen"]))
		self.assertListEqual(annotatorDict["n"], sorted([]))
