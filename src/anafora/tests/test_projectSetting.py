#!/usr/bin/env python
import os
#from unittest import TestCase
from unittest2 import TestCase
from django.conf import settings
from projectSetting import Schema, Mode, Project, ProjectSetting
from django.core.exceptions import ImproperlyConfigured
from xml.dom.minidom import parseString
from xml import dom

class ModeTests(TestCase):
	def setUp(self):
		pass

	def test_parse(self):
		parseStr0 = """
			<mode name="Entity" preannotation="false">
				<file>umls-schema.xml</file>
			</mode>"""

		dom0 = parseString(parseStr0).childNodes[0]
		mode0 = Mode.parseFromXMLDOM(dom0, "Temporal")
		self.assertEqual(mode0.name, "Entity")
		self.assertEqual(mode0.needPreannotation, False)
		self.assertEqual(mode0.preannotationFromMode, None)
		self.assertEqual(mode0.directSetGold, False)
		self.assertListEqual(mode0.schemaFile, ["umls-schema.xml"])
		self.assertEqual(mode0.getSchemaName(), "Temporal-Entity")

		parseStr1 = """
			<mode name="Relation" preannotation="true" preannotationFrom="Entity">
				<file>umls-schema.xml</file>
			</mode>"""
		dom1 = parseString(parseStr1).childNodes[0]
		mode1 = Mode.parseFromXMLDOM(dom1, "UMLS")
		self.assertEqual(mode1.name, "Relation")
		self.assertEqual(mode1.needPreannotation, True)
		self.assertEqual(mode1.preannotationFromMode, "Entity")
		self.assertEqual(mode1.directSetGold, False)
		self.assertListEqual(mode1.schemaFile, ["umls-schema.xml"])
		self.assertEqual(mode1.getSchemaName(), "UMLS-Relation")

		parseStr2 = """
			<mode name="RelationReGold" preannotation="true" preannotationFrom="Relation" directSetGold="true">
				<file>temporal-schema.xml</file>
				<file>umls-schema.xml</file>
			</mode>"""
		
		dom2 = parseString(parseStr2).childNodes[0]
		mode2 = Mode.parseFromXMLDOM(dom2, "Temporal")
		self.assertEqual(mode2.name, "RelationReGold")
		self.assertEqual(mode2.needPreannotation, True)
		self.assertEqual(mode2.preannotationFromMode, "Relation")
		self.assertEqual(mode2.directSetGold, True)
		self.assertListEqual(mode2.schemaFile, ["temporal-schema.xml", "umls-schema.xml"])
		self.assertEqual(mode2.getSchemaName(), "Temporal-RelationReGold")

class SchemaTest(TestCase):
	def test_parse(self):
		parseStr0 = """
		<schema name="Temporal">
			<mode name="Entity" preannotation="false">
				<file>temporal-schema.xml</file>
			</mode>
			<mode name="Relation" preannotation="true" preannotationFrom="Entity">
				<file>temporal-schema.xml</file>
			</mode>
			<mode name="RelationReGold" preannotation="true" preannotationFrom="Relation" directSetGold="true">
				<file>temporal-schema.xml</file>
				<file>umls-schema.xml</file>
			</mode>
		</schema>"""
		dom0 = parseString(parseStr0).childNodes[0]
		schema0 = Schema.parseFromXMLDOM(dom0)
		self.assertEqual(schema0.name, "Temporal")
		self.assertEqual(len(schema0.modes), 3)
		mode0_0 = schema0.getMode("Entity")
		self.assertEqual(mode0_0.name, "Entity")
		self.assertListEqual(mode0_0.schemaFile, ["temporal-schema.xml"])
		self.assertEqual(mode0_0.needPreannotation, False)
		self.assertEqual(mode0_0.preannotationFromMode, None)
		self.assertEqual(mode0_0.directSetGold, False)
		self.assertEqual(mode0_0.getSchemaName(), "Temporal-Entity")
		mode0_1 = schema0.getMode("Relation")
		self.assertEqual(mode0_1.name, "Relation")
		self.assertListEqual(mode0_1.schemaFile, ["temporal-schema.xml"])
		self.assertEqual(mode0_1.needPreannotation, True)
		self.assertEqual(mode0_1.preannotationFromMode, "Entity")
		self.assertEqual(mode0_1.directSetGold, False)
		self.assertEqual(mode0_1.getSchemaName(), "Temporal-Relation")
		mode0_2 = schema0.getMode("RelationReGold")
		self.assertEqual(mode0_2.name, "RelationReGold")
		self.assertListEqual(mode0_2.schemaFile, ["temporal-schema.xml", "umls-schema.xml"])
		self.assertEqual(mode0_2.needPreannotation, True)
		self.assertEqual(mode0_2.preannotationFromMode, "Relation")
		self.assertEqual(mode0_2.directSetGold, True)
		self.assertEqual(mode0_2.getSchemaName(), "Temporal-RelationReGold")

		parseStr1 = """
		<schema name="Coreference">
			<file>coref-schema.xml</file>
		</schema>"""
		dom1 = parseString(parseStr1).childNodes[0]
		schema1 = Schema.parseFromXMLDOM(dom1)
		self.assertEqual(schema1.name, "Coreference")
		self.assertEqual(len(schema1.modes), 1)
		mode1 = schema1.getMode()
		self.assertEqual(mode1.name, None)
		self.assertListEqual(mode1.schemaFile, ["coref-schema.xml"])
		self.assertEqual(mode1.needPreannotation, False)
		self.assertEqual(mode1.preannotationFromMode, None)
		self.assertEqual(mode1.directSetGold, False)
		self.assertEqual(mode1.getSchemaName(), "Coreference")

		parseStr2 = """
		<schema name="PropBank">
			<file>propbank-schema.xml</file>
			<file>coref-schema.xml</file>
		</schema>"""
		dom2 = parseString(parseStr2).childNodes[0]
		schema2 = Schema.parseFromXMLDOM(dom2)
		self.assertEqual(schema2.name, "PropBank")
		self.assertEqual(len(schema2.modes), 1)
		mode2 = schema2.getMode()
		self.assertEqual(mode2.name, None)
		self.assertListEqual(mode2.schemaFile, ["propbank-schema.xml", "coref-schema.xml"])
		self.assertEqual(mode2.needPreannotation, False)
		self.assertEqual(mode2.preannotationFromMode, None)
		self.assertEqual(mode2.directSetGold, False)
		self.assertEqual(mode2.getSchemaName(), "PropBank")
		
class ProjectTest(TestCase):
	def test_parse(self):
		parseStr0 = """
		<project name="Demo" numOfAnnotator="2">
			<admin>anaforaadmin</admin>
			<annotator>temporal</annotator>
			<annotator>verbs</annotator>
			<annotator>sharp</annotator>
			<schema>Temporal</schema>
			<schema>Coreference</schema>
			<schema>Thyme2v1</schema>
			<schema>Medicine</schema>
			<schema>UMLS</schema>
		</project>"""
		dom0 = parseString(parseStr0).childNodes[0]
		project0 = Project.parseFromXMLDOM(dom0)
		self.assertEqual(project0.name, "Demo")
		self.assertListEqual(project0.admins, ["anaforaadmin"])
		self.assertEqual(project0.numOfAnnotator, 2)
		self.assertListEqual(project0.annotators, ["temporal", "verbs", "sharp"])
		self.assertListEqual(project0.allowedSchemas, ["Temporal", "Coreference", "Thyme2v1", "Medicine", "UMLS"])

		parseStr1 = """
		<project name="EPIC" numOfAnnotator="2">
			<admin>anaforaadmin</admin>
			<annotator>temporal</annotator>
			<annotator>verbs</annotator>
			<annotator>sharp</annotator>
			<schema>PropBank</schema>
		</project>"""
		dom1 = parseString(parseStr1).childNodes[0]
		project1 = Project.parseFromXMLDOM(dom1)
		self.assertEqual(project1.name, "EPIC")
		self.assertListEqual(project1.admins, ["anaforaadmin"])
		self.assertEqual(project1.numOfAnnotator, 2)
		self.assertListEqual(project1.annotators, ["temporal", "verbs", "sharp"])
		self.assertListEqual(project1.allowedSchemas, ["PropBank"])

class ProjectSettingTests(TestCase):
	def setUp(self):
		self.settingFile = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, settings.ANAFORA_PROJECT_SETTING_FILENAME)

	def test_parseFromFile(self):
		fakeSettingFile = os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, "qq.xml")
		ps = ProjectSetting()
		self.assertRaisesRegexp(ImproperlyConfigured, "Can not find setting file '%s', please check your setting of ``ANAFORA_PROJECT_FILE_ROOT'' and ``ANAFORA_PROJECT_SETTING_FILENAME'' in your setting file" % fakeSettingFile, ps.parseFromFile, fakeSettingFile)

		ps = ProjectSetting()
		ps.parseFromFile(os.path.join(settings.ANAFORA_PROJECT_FILE_ROOT, settings.ANAFORA_PROJECT_SETTING_FILENAME))
		self.assertEqual(len(ps.projectList), 9)
		self.assertListEqual(sorted(["Demo","EventWorkshop", "Temporal", "CrossDocument", "EPIC", "SHARP", 'TempEval-2013-Train',  "THYME-subevent", "THYMEColonFinal" ]), sorted([str(projName) for projName in ps.projectList.keys()]))
		self.assertListEqual(sorted(["Temporal", "UMLS", "Coreference", "PropBank", "Medicine", "BLT", "BLT-alt", "THYME_QA", "TimeNorm", "Thyme2v1"]), sorted(ps.schemaList.keys()))
		project0 = ps.projectList["EventWorkshop"]
		self.assertEqual(project0.name, "EventWorkshop")
		self.assertListEqual(project0.admins, ["anaforaadmin"])
		self.assertEqual(len(project0.allowedSchemas), 4)
		self.assertTrue(reduce(lambda x,y: x and y, [isinstance(schema, Schema) for schema in project0.allowedSchemas]))
		self.assertEqual(project0.numOfAnnotator, 2)
		self.assertListEqual(project0.annotators, ["temporal", "verbs", "sharp"])
		schema0 = ps.getSchema("Temporal")
		self.assertEqual(schema0.name, "Temporal")
		self.assertEqual(len(schema0.modes), 3)
		mode0_0 = schema0.getMode("Entity")
		self.assertEqual(mode0_0.name, "Entity")
		self.assertEqual(mode0_0.needPreannotation, False)
		self.assertEqual(mode0_0.preannotationFromMode, None)
		self.assertEqual(mode0_0.directSetGold, False)
		mode0_1 = schema0.getMode("Relation")
		self.assertEqual(mode0_1.name, "Relation")
		self.assertEqual(mode0_1.needPreannotation, True)
		self.assertTrue(isinstance(mode0_1.preannotationFromMode, Mode))
		self.assertEqual(mode0_1.preannotationFromMode.name, "Entity")
		self.assertEqual(mode0_1.directSetGold, False)
		mode0_2 = schema0.getMode("RelationReGold")
		self.assertEqual(mode0_2.name, "RelationReGold")
		self.assertEqual(mode0_2.needPreannotation, True)
		self.assertTrue(isinstance(mode0_2.preannotationFromMode, Mode))
		self.assertEqual(mode0_2.preannotationFromMode.name, "Relation")
		self.assertEqual(mode0_2.directSetGold, True)

	def test_isSchemaExist(self):
		ps = ProjectSetting()
		ps.parseFromFile(self.settingFile)

		self.assertTrue(ps.isSchemaExist("Temporal", "Entity"))
		self.assertFalse(ps.isSchemaExist("Temporal"))
		self.assertTrue(ps.isSchemaExist("Coreference"))
		self.assertFalse(ps.isSchemaExist("Coreference", "Entity"))

	def test_getMode(self):
		ps = ProjectSetting()
		ps.parseFromFile(self.settingFile)
		self.assertRaisesRegexp(Exception, "Get schema 'Temporal' error", ps.getMode, "Temporal")
		self.assertRaisesRegexp(Exception, "Get schema 'Temporal' with mode name 'FakeEntity' error", ps.getMode, "Temporal", "FakeEntity")
		mode0 = ps.getMode("Temporal", "Entity")
		self.assertTrue(isinstance(mode0, Mode))
		self.assertEqual(mode0.name, "Entity")

		self.assertRaisesRegexp(Exception, "Get schema 'FakeTemporal' error", ps.getMode, "FakeTemporal")
		self.assertRaisesRegexp(Exception, "Get schema 'FakeTemporal' error", ps.getMode, "FakeTemporal", None)

		self.assertRaisesRegexp(Exception, "Get schema 'PropBank' with mode name 'fakeMode' error", ps.getMode, "PropBank", "fakeMode")

		mode1 = ps.getMode("PropBank")
		self.assertTrue(isinstance(mode1, Mode))
		self.assertEqual(mode1.name, None)

	def test_getSchemaFileNameFromSchemaAndMode(self):
		ps = ProjectSetting()
		ps.parseFromFile(self.settingFile)

		self.assertRaises(Exception, ps.getSchemaFileNameFromSchemaAndMode, "Temp")
		(fileName, needMoreSchema) = ps.getSchemaFileNameFromSchemaAndMode("Temporal", modeName="Entity")
		self.assertEqual(fileName, "temporal-schema.xml")
		self.assertEqual(needMoreSchema, False)
		self.assertRaisesRegexp(Exception, "The schema 'Temporal' with mode name 'Entity' of file index 1 is more than the size of schema files", ps.getSchemaFileNameFromSchemaAndMode, "Temporal", 1, "Entity")

		(fileName, needMoreSchema) = ps.getSchemaFileNameFromSchemaAndMode("BLT")
		self.assertEqual(fileName, "blt-schema.xml")
		self.assertEqual(needMoreSchema, True)
		(fileName, needMoreSchema) = ps.getSchemaFileNameFromSchemaAndMode("BLT", schemaFileIdx = 1)
		self.assertEqual(fileName, "med-schema.xml")
		self.assertEqual(needMoreSchema, True)
		(fileName, needMoreSchema) = ps.getSchemaFileNameFromSchemaAndMode("BLT", schemaFileIdx = 2)
		self.assertEqual(fileName, "thyme-qa-schema.xml")
		self.assertEqual(needMoreSchema, False)
		self.assertRaisesRegexp(Exception, "The schema 'BLT' of file index 3 is more than the size of schema files", ps.getSchemaFileNameFromSchemaAndMode, "BLT", 3)

	def test_getSchema(self):
		ps = ProjectSetting()
		ps.parseFromFile(self.settingFile)
		self.assertRaisesRegexp(Exception, "Get schema 'Temp' error", ps.getSchema, "Temp")
		schema = ps.getSchema("Temporal")
		self.assertEqual(schema.name, "Temporal")

		schema2 = ps.getSchema("Thyme2v1")
		self.assertEqual(schema2.name, "Thyme2v1")
		self.assertListEqual(sorted(schema2.modes), sorted(["Anatomy", "Correction", "Coreference"]))
		for tModeName in schema2.modes:
			tMode = ps.getMode("Thyme2v1", tModeName)
			print (tMode, tMode.needPreannotation, tMode.preannotationFromMode) #, None if tMode.preannotationFromMode is None else tMode.preannotationFromMode.name)

	def test_getSchemaMap(self):
		ps = ProjectSetting()
		ps.parseFromFile(self.settingFile)
				
		schemaMap = ps.getSchemaMap()
		self.assertListEqual(sorted(["Temporal", "UMLS", "Coreference", "PropBank", "Medicine", "BLT", "BLT-alt", "THYME_QA", "TimeNorm", "Thyme2v1"]), sorted(schemaMap.keys()))
		self.assertListEqual(sorted(["Entity", "Relation", "RelationReGold"]), sorted(schemaMap["Temporal"]))
		self.assertListEqual(sorted(["Entity", "Relation"]), sorted(schemaMap["UMLS"]))
		self.assertEqual(0, schemaMap["Coreference"])
		self.assertEqual(0, schemaMap["PropBank"])
		self.assertEqual(0, schemaMap["Medicine"])
		self.assertEqual(0, schemaMap["BLT"])
		self.assertEqual(0, schemaMap["BLT-alt"])
		self.assertEqual(0, schemaMap["THYME_QA"])
		self.assertEqual(0, schemaMap["TimeNorm"])
		self.assertListEqual(sorted(["Coreference", "Correction", "Anatomy"]), sorted(schemaMap["Thyme2v1"]))
