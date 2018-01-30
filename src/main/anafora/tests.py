#from django.test import TestCase
from unittest import TestCase
from django.test.client import RequestFactory
from django.core.urlresolvers import resolve
import views
import re
import json

class AnnotateTests(TestCase):
	#jsPattern = re.compile('<script type="text/JavaScript">[\s]*var _setting = ({[.]*});[\s]*</script>')
	jsPattern = re.compile('<script type="text/JavaScript">[\s]*var _setting = ({[\S\s]+});[\s]*</script>', re.MULTILINE)
	jsPropertyRepl = re.compile('[{]?([^\'"\s][^\'"\s]*[^\'"\s;])[\s]*:')

	basicSettingDict = {"schemaMap": '{&quot;PropBank&quot;: 0, &quot;CrossCoreference&quot;: [&quot;Coref&quot;, &quot;Empty&quot;], &quot;TimeNorm&quot;: 0, &quot;BLT&quot;: 0, &quot;Temporal&quot;: [&quot;RelationReGold&quot;, &quot;Relation&quot;, &quot;Entity&quot;], &quot;Thyme2v1&quot;: [&quot;Correction&quot;, &quot;Coreference&quot;], &quot;THYME_QA&quot;: 0, &quot;Coreference&quot;: 0, &quot;CrossTemporal&quot;: [&quot;Relation&quot;, &quot;Entity&quot;], &quot;Medicine&quot;: 0, &quot;UMLS&quot;: [&quot;Relation&quot;, &quot;Entity&quot;], &quot;BLT-alt&quot;: 0}', "root_url": "", "app_name": "annotate", "remoteUser": "guest", "annotator": "guest", "isCrossDoc": False, "isAdjudication": False}
	
	def setUp(self):
		self.factory = RequestFactory()

	def checkContext(self, contentStr, settingDict):
		""" Check settingVar in HTML context
		@type contextStr:   str
		@type settingDict:  dict
		"""
		jsStr = re.search(AnnotateTests.jsPattern, contentStr)
		self.assertNotEqual(jsStr, None)

		jsReplStr = re.sub(AnnotateTests.jsPropertyRepl, r'"\1" :', jsStr.group(1))
                tOutputDict = json.loads(jsReplStr)
                outputDict = {}
                for tKey in tOutputDict:
                        if isinstance(tOutputDict[tKey], unicode):
                                outputDict[str(tKey)] = str(tOutputDict[tKey])
                        else:
                                outputDict[str(tKey)] = tOutputDict[tKey]
                self.assertTrue(isinstance(outputDict, dict))
                self.assertTrue(isinstance(settingDict, dict))
                                
		self.assertDictEqual(outputDict, settingDict)
				

	def test_index(self):
		""" Test Index (input nothing)"""
		resolver = resolve('/')
		self.assertEqual(resolver.view_name, 'annotate.views.index')
		resolver = resolve('/annotate/')
		self.assertEqual(resolver.view_name, 'annotate.views.index')

		request = self.factory.get('/annotate/')
		request.META['REMOTE_USER'] = 'guest'
		response = views.index(request)
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.charset, 'utf-8')

		self.checkContext(response.content, AnnotateTests.basicSettingDict)

	def test_selectProject(self):
		""" Test selectProject"""
		resolver = resolve('/annotate/fakeProject/')
		self.assertEqual(resolver.view_name, 'annotate.views.selectProject')

		resolver = resolve('/annotate/Temporal')
		self.assertEqual(resolver.view_name, 'annotate.views.selectProject')

		resolver = resolve('/annotate/Temporal/')
		self.assertEqual(resolver.view_name, 'annotate.views.selectProject')

		request = self.factory.get('/annotate/SampleProject/')
		request.META['REMOTE_USER'] = 'guest'
		response = views.selectProject(request, 'SampleProject')
		self.assertEqual(response.status_code, 403)
		self.assertEqual(response.charset, 'utf-8')
		self.assertEqual(response.content, "Project Name: 'SampleProject' does not exists")

		request = self.factory.get('/annotate/Temporal/')
		request.META['REMOTE_USER'] = 'guest'
		response = views.selectProject(request, 'Temporal')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.charset, 'utf-8')
		settingVar = dict(AnnotateTests.basicSettingDict)
		settingVar["projectName"] = "Temporal"
		self.checkContext(response.content, settingVar)

	def test_selectCorpus(self):
		""" Test selectProject"""
		resolver = resolve('/annotate/SampleProject/SampleCorpus')
		self.assertEqual(resolver.view_name, 'annotate.views.selectCorpus')

		resolver = resolve('/annotate/Temporal/fakeCorpus')
		self.assertEqual(resolver.view_name, 'annotate.views.selectCorpus')

		resolver = resolve('/annotate/Temporal/ColonCancer')
		self.assertEqual(resolver.view_name, 'annotate.views.selectCorpus')

		resolver = resolve('/annotate/Temporal/ColonCancer/')
		self.assertEqual(resolver.view_name, 'annotate.views.selectCorpus')

		request = self.factory.get('/annotate/fakeProject/fakeCorpus')
		request.META['REMOTE_USER'] = 'guest'
		response = views.selectCorpus(request, 'fakeProject', 'fakeCorpus')
		self.assertEqual(response.status_code, 403)
		self.assertEqual(response.charset, 'utf-8')
		self.assertEqual(response.content, "Project Name: 'fakeProject' does not exists")

		request = self.factory.get('/annotate/Temporal/fakeCorpus')
		request.META['REMOTE_USER'] = 'guest'
		response = views.selectCorpus(request, 'Temporal', 'fakeCorpus')
		self.assertEqual(response.status_code, 403)
		self.assertEqual(response.charset, 'utf-8')
		self.assertEqual(response.content, "Corpus Name: 'fakeCorpus' does not exists")

		request = self.factory.get('/annotate/Temporal/ColonCancer/')
		request.META['REMOTE_USER'] = 'guest'
		response = views.selectCorpus(request, 'Temporal', 'ColonCancer')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.charset, 'utf-8')
		settingVar = dict(AnnotateTests.basicSettingDict)
		settingVar["projectName"] = "Temporal"
		settingVar["corpusName"] = "ColonCancer"
		self.checkContext(response.content, settingVar)

	def test_settingExist(self):
		pass
		

	def test_annotateNormal(self):
		""" Test views.annotateNormal
		"""

	
		resolver = resolve('/annotate/Temporal/ColonCancer/ID063_clinic_185/Medicine/')
		self.assertEqual(resolver.view_name, 'annotate.views.annotateNormal')

		resolver = resolve('/annotate/Temporal/ColonCancer/ID063_clinic_185/Medicine')
		self.assertEqual(resolver.view_name, 'annotate.views.annotateNormal')

		request = self.factory.get('/annotate/Temporal/ColonCancer/ID063_clinic_185/')
		request.META['REMOTE_USER'] = 'guest'
		response = views.annotateNormal(request, projectName='Temporal', corpusName='ColonCancer', taskName='ID063_clinic_185', schema='Temporal', schemaMode = 'Entity')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.charset, 'utf-8')
