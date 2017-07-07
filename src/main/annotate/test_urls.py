#!/usr/bin/env python
import os
#from unittest import TestCase
import unittest2
from django.test.client import Client
from django.test.client import RequestFactory
from django.core.urlresolvers import resolve
import views
import json

class AnnotateURLTest(unittest2.TestCase):
	def setUp(self):
		self.client = Client()
		self.factory = RequestFactory()
	
	def test_crossDocDir(self):
		response = self.client.get('/annotate/getDir/CrossDocument/ColonCancer/Thyme2v1.Correction/_crossDoc/', REMOTE_USER = 'wtchen')
		availableCrossTask = json.loads(response.content)

		self.assertListEqual(sorted(availableCrossTask.keys()), sorted(["i", "n", "c"]))
		self.assertListEqual(availableCrossTask["i"], sorted([]))
		self.assertListEqual(availableCrossTask["n"], sorted(["ID011_merge", "ID017", "ID089", "ID177_merge"]))
		self.assertListEqual(availableCrossTask["c"], sorted([]))

	def test_crossDoc_getFile(self):
		resolver = resolve('/annotate/Temporal/ColonCancer/ID060_clinic_176/Temporal.Entity/view/krwr4334/')
		self.assertEqual(resolver.view_name, 'annotate.views.annotateNormal')
		self.assertDictEqual(resolver.kwargs, {"projectName": "Temporal", "corpusName": "ColonCancer", "taskName": "ID060_clinic_176", "schema": "Temporal", "schemaMode": "Entity", "view":"view", "crossDoc":None, "adjudication":None, "annotator": "krwr4334"})

		resolver = resolve('/annotate/CrossDocument/ColonCancer/ID017/CrossCoreference.Coref2/view/_crossDoc/wtchen/')
		self.assertEqual(resolver.view_name, 'annotate.views.annotateNormal')
		self.assertDictEqual(resolver.kwargs, {"projectName": "CrossDocument", "corpusName": "ColonCancer", "taskName": "ID017", "schema": "CrossCoreference", "schemaMode": "Coref2", "view":"view", "crossDoc":"_crossDoc", "adjudication":None, "annotator": "wtchen"})

		resolver = resolve('/annotate/CrossDocument/ColonCancer/ID017/CrossCoreference.Coref2/_crossDoc/')
		self.assertEqual(resolver.view_name, 'annotate.views.annotateNormal')
		
		self.assertDictEqual(resolver.kwargs, {"projectName": "CrossDocument", "corpusName": "ColonCancer", "taskName": "ID017", "schema": "CrossCoreference", "schemaMode": "Coref2", "view": None, "crossDoc":"_crossDoc", "adjudication":None, "annotator": None})

		resolver = resolve('/annotate/getDir/Temporal/ColonCancer/Temporal/')
		self.assertEqual(resolver.view_name, 'annotate.views.getTaskFromProjectCorpusName')
		self.assertDictEqual(resolver.kwargs, {"projectName": "Temporal", "corpusName": "ColonCancer", "schemaName": "Temporal", "schemaMode": None, "crossDoc": None })

		resolver = resolve('/annotate/getDir/Temporal/ColonCancer/SeaIce/_cross/')
		self.assertEqual(resolver.view_name, 'annotate.views.getSubTaskFromProjectCorpusTaskName')
		self.assertDictEqual(resolver.kwargs, {"projectName": "Temporal", "corpusName": "ColonCancer", "parentTaskName": "SeaIce"})

		resolver = resolve('/annotate/getDir/THYMEColonFinal/Dev/TimeNorm.Adjudication/')
		self.assertEqual(resolver.view_name, 'annotate.views.getAdjudicationTaskFromProjectCorpusName')
		self.assertDictEqual(resolver.kwargs, {"projectName": "THYMEColonFinal", "corpusName": "Dev", "schemaName": "TimeNorm", "schemaMode": None})

		resolver = resolve('/annotate/THYMEColonFinal/Dev/ID021_clinic_063/TimeNorm.Adjudication/')
		self.assertEqual(resolver.view_name, 'annotate.views.annotateNormal')
		self.assertDictEqual(resolver.kwargs, {"projectName": "THYMEColonFinal", "corpusName": "Dev", "taskName": "ID021_clinic_063", "schema": "TimeNorm", "schemaMode": None, "annotator": None, "adjudication": "Adjudication", "crossDoc": None, "view": None})

	def test_getXML(self):
		resolver = resolve('/annotate/Temporal/ColonCancer/ID060_clinic_176/Temporal.Entity/krwr4334/')
		self.assertEqual(resolver.view_name, 'annotate.views.annotateNormal')
		self.assertEqual(resolver.kwargs, {'projectName': 'Temporal', 'corpusName': 'ColonCancer', 'taskName': 'ID060_clinic_176', 'schema': 'Temporal', 'schemaMode': 'Entity', 'adjudication': None, 'view': None, 'crossDoc': None, 'annotator': 'krwr4334'})

		resolver = resolve('/annotate/xml/THYMEColonFinal/Dev/ID036_clinic_108/TimeNorm.Adjudication/')
		self.assertEqual(resolver.view_name, 'annotate.views.getAnaforaXMLFile')

		self.assertEqual(resolver.kwargs, {'projectName': 'THYMEColonFinal', 'corpusName': 'Dev', 'taskName': 'ID036_clinic_108', 'schemaName': 'TimeNorm', 'schemaMode': None, 'isAdj': 'Adjudication', 'subTaskName': None})

		resolver = resolve('/annotate/getDir/THYMEColonFinal/Dev/TimeNorm/view/')
		self.assertEqual(resolver.view_name, 'annotate.views.getAllTask')
		self.assertEqual(resolver.kwargs, {'projectName': 'THYMEColonFinal', 'corpusName': 'Dev', 'schemaName': 'TimeNorm', 'schemaMode': None, 'crossDoc': None})

		resolver = resolve('/annotate/saveFile/TempEval-2013-Train/Test/AP_20130322/TimeNorm.Adjudication/')
		self.assertEqual(resolver.view_name, 'annotate.views.writeFile')
		self.assertEqual(resolver.kwargs, {'projectName': 'TempEval-2013-Train', 'corpusName': 'Test', 'schemaName': 'TimeNorm', 'isAdj': 'Adjudication','taskName': 'AP_20130322' })
		
		resolver = resolve('/annotate/setCompleted/THYMEColonFinal/Test/ID031_clinic_091/Thyme2v1.Coreference.Adjudication/')
		self.assertEqual(resolver.view_name, 'annotate.views.setCompleted')
		self.assertEqual(resolver.kwargs, {'projectName': 'THYMEColonFinal', 'corpusName': 'Test', 'schemaName': 'Thyme2v1', 'schemaMode': 'Coreference', 'isAdj': 'Adjudication','taskName': 'ID031_clinic_091' })

	def test_getAnnotator(self):
		resolver = resolve('/annotate/annotator/THYMEColonFinal/Dev/ID004_clinic_010/TimeNorm/')
		self.assertEqual(resolver.view_name, 'annotate.views.getAnnotator')
		self.assertEqual(resolver.kwargs, {'projectName': 'THYMEColonFinal', 'corpusName': 'Dev', 'taskName': 'ID004_clinic_010', 'schemaName': 'TimeNorm', 'schemaMode': None})

