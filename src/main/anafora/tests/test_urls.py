#!/usr/bin/env python
import os
from unittest import TestCase
from django.test import TestCase, SimpleTestCase
#import unittest2
from django.test.client import Client
from django.test.client import RequestFactory
from django.core.urlresolvers import resolve
import anafora.views
#import views
import json

class AnnotateURLTest(SimpleTestCase):
	def setUp(self):
		self.client = Client()
		self.factory = RequestFactory()
	
	def test_crossDocDir(self):
		testURL = '/anafora/getDir/CrossDocument/ColonCancer/Thyme2v1.Correction/_crossDoc/'
		resolver = resolve(testURL)
		self.assertEqual(resolver.view_name, 'anafora.views.getTaskFromProjectCorpusName')
		self.assertEqual(resolver.kwargs, {'projectName': 'CrossDocument', 'corpusName': 'ColonCancer', 'schemaName': 'Thyme2v1', 'schemaMode': 'Correction', 'crossDoc': '_crossDoc'})
		
		response = self.client.get(testURL, REMOTE_USER = 'reganma')
		availableCrossTask = json.loads(response.content)

		self.assertListEqual(sorted(availableCrossTask.keys()), sorted(["i", "n", "c"]))
		
		self.assertListEqual(availableCrossTask["i"], sorted([]))
		self.assertListEqual(availableCrossTask["n"], sorted(["ID017", "ID089"]))
		self.assertListEqual(availableCrossTask["c"], sorted(["ID002", "ID009", "ID027", "ID032"]))

	def test_crossDoc_getFile(self):
		resolver = resolve('/anafora/Temporal/ColonCancer/ID060_clinic_176/Temporal.Entity/view/krwr4334/')
		self.assertEqual(resolver.view_name, 'anafora.views.annotateNormal')
		self.assertDictEqual(resolver.kwargs, {"projectName": "Temporal", "corpusName": "ColonCancer", "taskName": "ID060_clinic_176", "schema": "Temporal", "schemaMode": "Entity", "view":"view", "crossDoc":None, "adjudication":None, "annotator": "krwr4334"})

		resolver = resolve('/anafora/CrossDocument/ColonCancer/ID017/CrossCoreference.Coref2/view/_crossDoc/wtchen/')
		self.assertEqual(resolver.view_name, 'anafora.views.annotateNormal')
		self.assertDictEqual(resolver.kwargs, {"projectName": "CrossDocument", "corpusName": "ColonCancer", "taskName": "ID017", "schema": "CrossCoreference", "schemaMode": "Coref2", "view":"view", "crossDoc":"_crossDoc", "adjudication":None, "annotator": "wtchen"})

		resolver = resolve('/anafora/CrossDocument/ColonCancer/ID017/CrossCoreference.Coref2/_crossDoc/')
		self.assertEqual(resolver.view_name, 'anafora.views.annotateNormal')
		
		self.assertDictEqual(resolver.kwargs, {"projectName": "CrossDocument", "corpusName": "ColonCancer", "taskName": "ID017", "schema": "CrossCoreference", "schemaMode": "Coref2", "view": None, "crossDoc":"_crossDoc", "adjudication":None, "annotator": None})

		resolver = resolve('/anafora/getDir/Temporal/ColonCancer/Temporal/')
		self.assertEqual(resolver.view_name, 'anafora.views.getTaskFromProjectCorpusName')
		self.assertDictEqual(resolver.kwargs, {"projectName": "Temporal", "corpusName": "ColonCancer", "schemaName": "Temporal", "schemaMode": None, "crossDoc": None })

		resolver = resolve('/anafora/getDir/Temporal/ColonCancer/SeaIce/_cross/')
		self.assertEqual(resolver.view_name, 'anafora.views.getSubTaskFromProjectCorpusTaskName')
		self.assertDictEqual(resolver.kwargs, {"projectName": "Temporal", "corpusName": "ColonCancer", "parentTaskName": "SeaIce"})

		resolver = resolve('/anafora/getDir/THYMEColonFinal/Dev/TimeNorm.Adjudication/')
		self.assertEqual(resolver.view_name, 'anafora.views.getAdjudicationTaskFromProjectCorpusName')
		self.assertDictEqual(resolver.kwargs, {"projectName": "THYMEColonFinal", "corpusName": "Dev", "schemaName": "TimeNorm", "schemaMode": None, "crossDoc": None})

		resolver = resolve('/anafora/THYMEColonFinal/Dev/ID021_clinic_063/TimeNorm.Adjudication/')
		self.assertEqual(resolver.view_name, 'anafora.views.annotateNormal')
		self.assertDictEqual(resolver.kwargs, {"projectName": "THYMEColonFinal", "corpusName": "Dev", "taskName": "ID021_clinic_063", "schema": "TimeNorm", "schemaMode": None, "annotator": None, "adjudication": "Adjudication", "crossDoc": None, "view": None})

		resolver = resolve('/anafora/getDir/CrossDocument/ColonCancer/Thyme2v1.Correction.Adjudication/_crossDoc/')
		self.assertEqual(resolver.view_name, 'anafora.views.getAdjudicationTaskFromProjectCorpusName')
		self.assertDictEqual(resolver.kwargs, {"projectName": "CrossDocument", "corpusName": "ColonCancer", "schemaName": "Thyme2v1", "schemaMode": "Correction", "crossDoc": "_crossDoc"})

	def test_getXML(self):
		resolver = resolve('/anafora/Temporal/ColonCancer/ID060_clinic_176/Temporal.Entity/krwr4334/')
		self.assertEqual(resolver.view_name, 'anafora.views.annotateNormal')
		self.assertEqual(resolver.kwargs, {'projectName': 'Temporal', 'corpusName': 'ColonCancer', 'taskName': 'ID060_clinic_176', 'schema': 'Temporal', 'schemaMode': 'Entity', 'adjudication': None, 'view': None, 'crossDoc': None, 'annotator': 'krwr4334'})

		resolver = resolve('/anafora/Temporal/ColonCancer/ID060_clinic_176/Temporal.Entity.Adjudication/view/')
		self.assertEqual(resolver.view_name, 'anafora.views.annotateNormal')
		self.assertEqual(resolver.kwargs, {'projectName': 'Temporal', 'corpusName': 'ColonCancer', 'taskName': 'ID060_clinic_176', 'schema': 'Temporal', 'schemaMode': 'Entity', 'adjudication': 'Adjudication', 'view': 'view', 'crossDoc': None, 'annotator': None})


		resolver = resolve('/anafora/xml/THYMEColonFinal/Dev/ID036_clinic_108/TimeNorm.Adjudication/')
		self.assertEqual(resolver.view_name, 'anafora.views.getAnaforaXMLFile')

		self.assertEqual(resolver.kwargs, {'projectName': 'THYMEColonFinal', 'corpusName': 'Dev', 'taskName': 'ID036_clinic_108', 'schemaName': 'TimeNorm', 'schemaMode': None, 'isAdj': 'Adjudication', 'subTaskName': None})


		resolver = resolve('/anafora/saveFile/TempEval-2013-Train/Test/AP_20130322/TimeNorm.Adjudication/')
		self.assertEqual(resolver.view_name, 'anafora.views.writeFile')
		self.assertEqual(resolver.kwargs, {'projectName': 'TempEval-2013-Train', 'corpusName': 'Test', 'schemaName': 'TimeNorm', 'isAdj': 'Adjudication','taskName': 'AP_20130322' })
		
		resolver = resolve('/anafora/setCompleted/THYMEColonFinal/Test/ID031_clinic_091/Thyme2v1.Coreference.Adjudication/')
		self.assertEqual(resolver.view_name, 'anafora.views.setCompleted')
		self.assertEqual(resolver.kwargs, {'projectName': 'THYMEColonFinal', 'corpusName': 'Test', 'schemaName': 'Thyme2v1', 'schemaMode': 'Coreference', 'isAdj': 'Adjudication','taskName': 'ID031_clinic_091' })

		resolver = resolve('/anafora/setCompleted/THYMEColonFinal/Test/ID031_clinic_091/Thyme2v1.Coreference/')
		self.assertEqual(resolver.view_name, 'anafora.views.setCompleted')
		self.assertEqual(resolver.kwargs, {'projectName': 'THYMEColonFinal', 'corpusName': 'Test', 'schemaName': 'Thyme2v1', 'schemaMode': 'Coreference', 'isAdj': None,'taskName': 'ID031_clinic_091' })

		resolver = resolve('/anafora/setCompleted/THYMEColonFinal/Dev/ID036_clinic_108/TimeNorm.Adjudication/')
		self.assertEqual(resolver.view_name, 'anafora.views.setCompleted')
		self.assertEqual(resolver.kwargs, {'projectName': 'THYMEColonFinal', 'corpusName': 'Dev', 'schemaName': 'TimeNorm', 'isAdj': 'Adjudication','taskName': 'ID036_clinic_108' })

		resolver = resolve('/anafora/setCompleted/THYMEColonFinal/Dev/ID036_clinic_108/TimeNorm/')
		self.assertEqual(resolver.view_name, 'anafora.views.setCompleted')
		self.assertEqual(resolver.kwargs, {'projectName': 'THYMEColonFinal', 'corpusName': 'Dev', 'schemaName': 'TimeNorm', 'isAdj': None,'taskName': 'ID036_clinic_108' })

	def test_getAnnotator(self):
		annotatorURL0 = '/anafora/annotator/THYMEColonFinal/Dev/ID004_clinic_010/TimeNorm/'
		resolver = resolve(annotatorURL0)
		self.assertEqual(resolver.view_name, 'anafora.views.getAnnotator')
		self.assertEqual(resolver.kwargs, {'projectName': 'THYMEColonFinal', 'corpusName': 'Dev', 'taskName': 'ID004_clinic_010', 'schemaName': 'TimeNorm', 'schemaMode': None, 'isAdj': None })
		response = self.client.get(annotatorURL0, REMOTE_USER = 'wech5560')
		annotators = json.loads(response.content)
		self.assertListEqual(sorted(annotators.keys()), sorted(["i", "n", "c"]))
		
		self.assertListEqual(annotators["i"], sorted([]))
		self.assertListEqual(annotators["n"], sorted([]))
		self.assertListEqual(annotators["c"], sorted([]))

		annotatorURL1 = '/anafora/annotator/THYMEColonFinal/Dev/ID004_clinic_010/Temporal.Entity/'
		resolver = resolve(annotatorURL1)
		self.assertEqual(resolver.view_name, 'anafora.views.getAnnotator')
		self.assertEqual(resolver.kwargs, {'projectName': 'THYMEColonFinal', 'corpusName': 'Dev', 'taskName': 'ID004_clinic_010', 'schemaName': 'Temporal', 'schemaMode': 'Entity', 'isAdj': None })
		response = self.client.get(annotatorURL1, REMOTE_USER = 'wech5560')
		annotators = json.loads(response.content)
		self.assertListEqual(sorted(annotators.keys()), sorted(["i", "n", "c"]))
		self.assertListEqual(annotators["i"], sorted([]))
		self.assertListEqual(annotators["n"], sorted([]))
		self.assertListEqual(annotators["c"], sorted(["Gold", "Protege2", "Protege1"]))

		annotatorURL2 = '/anafora/annotator/THYMEColonFinal/Dev/ID004_clinic_010/Temporal.Entity.Adjudication/'
		resolver = resolve(annotatorURL2)
		self.assertEqual(resolver.view_name, 'anafora.views.getAnnotator')
		self.assertEqual(resolver.kwargs, {'projectName': 'THYMEColonFinal', 'corpusName': 'Dev', 'taskName': 'ID004_clinic_010', 'schemaName': 'Temporal', 'schemaMode': 'Entity', 'isAdj': 'Adjudication' })

		response = self.client.get(annotatorURL2, REMOTE_USER = 'wech5560')
		annotators = json.loads(response.content)
		self.assertListEqual(sorted(annotators.keys()), sorted(["i", "n", "c"]))
		self.assertListEqual(annotators["i"], sorted([]))
		self.assertListEqual(annotators["n"], sorted([]))
		self.assertListEqual(annotators["c"], sorted(["Protege"]))

		annotatorURL3 = '/anafora/annotator/Cross-THYMEColonFinal/Train/ID001/Thyme2v1.Correction/'
		resolver = resolve(annotatorURL3)
		self.assertEqual(resolver.view_name, 'anafora.views.getAnnotator')
		self.assertEqual(resolver.kwargs, {'projectName': 'Cross-THYMEColonFinal', 'corpusName': 'Train', 'taskName': 'ID001', 'schemaName': 'Thyme2v1', 'schemaMode': 'Correction', 'isAdj': None })

		response = self.client.get(annotatorURL3, REMOTE_USER = 'wech5560')
		annotators = json.loads(response.content)
		self.assertListEqual(sorted(annotators.keys()), sorted(["i", "n", "c"]))
		self.assertListEqual(annotators["i"], sorted(["haco1069"]))
		self.assertListEqual(annotators["n"], sorted([]))
		self.assertListEqual(annotators["c"], sorted(["reganma"]))

		annotatorURL4 = '/anafora/annotator/Cross-THYMEColonFinal/Train/ID001/Thyme2v1.Correction.Adjudication/'
		resolver = resolve(annotatorURL4)
		self.assertEqual(resolver.view_name, 'anafora.views.getAnnotator')
		self.assertEqual(resolver.kwargs, {'projectName': 'Cross-THYMEColonFinal', 'corpusName': 'Train', 'taskName': 'ID001', 'schemaName': 'Thyme2v1', 'schemaMode': 'Correction', 'isAdj': "Adjudication" })

		response = self.client.get(annotatorURL4, REMOTE_USER = 'wech5560')
		annotators = json.loads(response.content)
		self.assertListEqual(sorted(annotators.keys()), sorted(["i", "n", "c"]))
		self.assertListEqual(annotators["i"], sorted(["wtchen"]))
		self.assertListEqual(annotators["n"], sorted([]))
		self.assertListEqual(annotators["c"], sorted(["krwr4334"]))

	def test_viewAvailableTask(self):
		testURL0 = '/anafora/getDir/THYMEColonFinal/Train/Thyme2v1.Coreference.Adjudication/view/'
		resolver = resolve(testURL0)
		self.assertEqual(resolver.view_name, 'anafora.views.getAllTask')
		self.assertEqual(resolver.kwargs, {'projectName': 'THYMEColonFinal', 'corpusName': 'Train', 'schemaName': 'Thyme2v1', 'schemaMode': 'Coreference', 'isAdj': 'Adjudication', 'crossDoc': None})

		response = self.client.get(testURL0, REMOTE_USER = 'wech5560')
		availableTask = json.loads(response.content)
		self.assertListEqual(sorted(availableTask),sorted(['ID049_clinic_142', 'ID184_clinic_537']))

		testURL1 = '/anafora/getDir/THYMEColonFinal/Train/Thyme2v1.Coreference/view/'
		resolver = resolve(testURL1)
		self.assertEqual(resolver.view_name, 'anafora.views.getAllTask')
		self.assertEqual(resolver.kwargs, {'projectName': 'THYMEColonFinal', 'corpusName': 'Train', 'schemaName': 'Thyme2v1', 'schemaMode': 'Coreference', 'isAdj': None, 'crossDoc': None})

		response = self.client.get(testURL0, REMOTE_USER = 'wech5560')
		availableTask = json.loads(response.content)
		self.assertListEqual(sorted(availableTask),sorted(['ID049_clinic_142', 'ID184_clinic_537']))

		testURL2 = '/anafora/getDir/THYMEColonFinal/Dev/TimeNorm/view/'
		resolver = resolve(testURL2)
		self.assertEqual(resolver.view_name, 'anafora.views.getAllTask')
		self.assertEqual(resolver.kwargs, {'projectName': 'THYMEColonFinal', 'corpusName': 'Dev', 'schemaName': 'TimeNorm', 'schemaMode': None, 'isAdj': None, 'crossDoc': None})

		response = self.client.get(testURL2, REMOTE_USER = 'wech5560')
		availableTask = json.loads(response.content)
		self.assertListEqual(sorted(availableTask),sorted(['ID036_clinic_108']))

		testURL3 = '/anafora/getDir/THYMEColonFinal/Dev/Temporal.Entity.Adjudication/view/'
		resolver = resolve(testURL3)
		self.assertEqual(resolver.view_name, 'anafora.views.getAllTask')
		self.assertEqual(resolver.kwargs, {'projectName': 'THYMEColonFinal', 'corpusName': 'Dev', 'schemaName': 'Temporal', 'schemaMode': 'Entity', 'isAdj': 'Adjudication', 'crossDoc': None})

		response = self.client.get(testURL3, REMOTE_USER = 'wech5560')
		availableTask = json.loads(response.content)
		self.assertListEqual(sorted(availableTask),sorted(["ID004_clinic_010", "ID004_clinic_012", "ID004_path_011", "ID012_clinic_034", "ID012_clinic_036", "ID012_path_035", "ID013_clinic_037", "ID013_clinic_039", "ID013_path_038", "ID020_clinic_058", "ID020_clinic_060", "ID020_path_059", "ID021_clinic_061", "ID021_clinic_063", "ID021_path_062", "ID028_clinic_082", "ID028_clinic_084", "ID028_path_083", "ID029_clinic_085", "ID029_clinic_087", "ID029_path_086", "ID036_clinic_106", "ID036_clinic_108", "ID036_path_107", "ID044_clinic_127", "ID044_clinic_129", "ID044_path_128", "ID045_clinic_130", "ID045_clinic_132", "ID045_path_131", "ID052_clinic_151", "ID052_clinic_153", "ID052_path_152a", "ID053_clinic_154", "ID053_clinic_155", "ID053_path_156", "ID060_clinic_176", "ID060_clinic_178", "ID060_path_177", "ID061_clinic_179", "ID061_clinic_181", "ID061_path_180a", "ID068_clinic_200", "ID068_clinic_202", "ID068_path_201", "ID069_clinic_203", "ID069_clinic_205", "ID069_path_204", "ID076_clinic_224", "ID076_clinic_226", "ID076_path_225", "ID077_clinic_227", "ID077_clinic_229", "ID077_path_228", "ID085_clinic_251", "ID085_clinic_253", "ID085_path_252a", "ID092_clinic_271", "ID092_clinic_273", "ID092_path_272", "ID093_clinic_274", "ID093_clinic_276", "ID093_path_275a", "ID100_clinic_295", "ID100_clinic_297", "ID100_path_296", "ID101_clinic_298", "ID101_clinic_300", "ID101_path_299", "ID108_clinic_316", "ID108_clinic_318", "ID108_path_317", "ID109_clinic_319", "ID109_clinic_321", "ID109_path_320", "ID117_clinic_342", "ID117_clinic_344", "ID117_path_343", "ID124_clinic_363", "ID124_clinic_365", "ID124_path_364", "ID125_clinic_366", "ID125_clinic_368", "ID125_path_367", "ID132_clinic_387", "ID132_clinic_389", "ID132_path_388", "ID133_clinic_390", "ID133_clinic_392", "ID133_path_391a", "ID140_clinic_411", "ID140_clinic_413", "ID140_path_412", "ID141_clinic_414", "ID141_clinic_416", "ID141_path_415", "ID148_clinic_435", "ID148_clinic_437", "ID148_path_436a", "ID149_clinic_438", "ID149_clinic_440", "ID149_path_439a", "ID156_clinic_459", "ID156_clinic_461", "ID156_path_460a", "ID157_clinic_462", "ID157_clinic_464", "ID157_path_463", "ID164_clinic_480", "ID164_clinic_482", "ID164_path_481a", "ID165_clinic_483", "ID165_clinic_485", "ID165_path_484a", "ID172_clinic_503", "ID172_clinic_505", "ID172_path_504", "ID173_clinic_506", "ID173_clinic_507", "ID173_path_506", "ID180_clinic_526", "ID180_clinic_528", "ID180_path_527", "ID181_clinic_529", "ID181_clinic_531", "ID181_path_530", "ID188_clinic_547", "ID188_clinic_549", "ID188_path_548", "ID189_clinic_550", "ID189_clinic_552", "ID189_path_551", "ID196_clinic_576", "ID196_clinic_578", "ID196_path_577", "ID197_clinic_579", "ID197_clinic_581", "ID197_path_580", "ID205_clinic_597", "ID205_clinic_599", "ID205_path_598", "ID212_clinic_617", "ID212_clinic_619", "ID212_path_618b", "ID213_clinic_620", "ID213_clinic_622", "ID213_path_621a"]))

		testURL4 = '/anafora/getDir/CrossDocument/ColonCancer/Thyme2v1.Correction/view/_crossDoc/'
		resolver = resolve(testURL4)
		self.assertEqual(resolver.view_name, 'anafora.views.getAllTask')
		self.assertEqual(resolver.kwargs, {'projectName': 'CrossDocument', 'corpusName': 'ColonCancer', 'schemaName': 'Thyme2v1', 'schemaMode': 'Correction', 'crossDoc': '_crossDoc', 'isAdj': None})
		
		response = self.client.get(testURL4, REMOTE_USER = 'wech5560')
		availableTask = json.loads(response.content)
		self.assertListEqual(sorted(availableTask), ["ID002", "ID009", "ID027", "ID032"])

		testURL5 = '/anafora/getDir/CrossDocument/ColonCancer/Thyme2v1.Correction.Adjudication/view/_crossDoc/'
		resolver = resolve(testURL5)
		self.assertEqual(resolver.view_name, 'anafora.views.getAllTask')
		self.assertEqual(resolver.kwargs, {'projectName': 'CrossDocument', 'corpusName': 'ColonCancer', 'schemaName': 'Thyme2v1', 'schemaMode': 'Correction', 'crossDoc': '_crossDoc', 'isAdj': 'Adjudication' })
		
		response = self.client.get(testURL5, REMOTE_USER = 'wech5560')
		availableTask = json.loads(response.content)
		self.assertListEqual(sorted(availableTask), ["ID002", "ID009", "ID027", "ID032"])
