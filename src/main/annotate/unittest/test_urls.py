#!/usr/bin/env python
import os
from unittest import TestCase
from django.test.client import Client
from django.test.client import RequestFactory
from django.core.urlresolvers import resolve
import views
import json

class AnnotateURLTest(TestCase):
	def setUp(self):
		self.client = Client()
		self.factory = RequestFactory()
	
	def test_crossDocDir(self):
		response = self.client.get('/annotate/getDir/CrossDocument/ColonCancer/CrossCoreference.Coref/_crossDoc/', REMOTE_USER = 'wtchen')
		availableCrossTask = json.loads(response.content)

		self.assertListEqual(sorted(availableCrossTask.keys()), sorted(["i", "n", "c"]))
		self.assertListEqual(availableCrossTask["i"], sorted(["ID017"]))
		self.assertListEqual(availableCrossTask["n"], sorted(["ID025"]))
		self.assertListEqual(availableCrossTask["c"], sorted(["sample-3-982-540"]))

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
	def test_getXML(self):
		response = self.client.get('/annotate/Temporal/ColonCancer/ID060_clinic_176/Temporal.Entity/krwr4334/', REMOTE_USER = 'wtchen')
		self.assertEqual(response.status_code, 200)
