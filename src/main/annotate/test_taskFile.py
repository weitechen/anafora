#!/usr/bin/env python
import os
from unittest import TestCase

from taskFile import *

class TaskFileTest(TestCase):
	def setUp(self):
		pass

	def test_constructor(self):
		fileName0 = "ID017_clinic_049.Coreference.wech5560.completed."
		self.assertRaisesRegexp(ValidationError, "XML File format error ('%s'). %s" % (fileName0, TaskFile.formatStr))
		fileName1 = "ID017_clinic_049.Coreference.wech5560.completed"
		self.assertRaisesRegexp(ValidationError, "XML File format error ('%s'). %s" % (fileName1, TaskFile.formatStr))


		fileName2 = "ID017_clinic_049.Coreference.wech5560.complete.xml"
		self.assertRaisesRegexp(ValidationError, "XML File format error ('%s'): please check the value of 'completed/inprogress'. %s" % (fileName2, TaskFile.formatStr))
		fileName3 = "ID017_clinic_049.Coreference.wech5560.in-progress.xml"
		self.assertRaisesRegexp(ValidationError, "XML File format error ('%s'): please check the value of 'completed/inprogress'. %s" % (fileName3, TaskFile.formatStr))

		fileName4 = "ID017_clinic_049.Temporal-Entity-Adj.wech5560.complete.xml"
		self.assertRaisesRegexp(ValidationError, "XML File format error ('%s'): please check the value of your adjudication indicator. %s" % (fileName4, TaskFile.formatStr))

		fileName5 = "ID017_clinic_049.Temporal-Entity-Adjudication-QQ.wech5560.complete.xml"
		self.assertRaisesRegexp(ValidationError, "XML File format error ('%s'). %s" % (fileName5, TaskFile.formatStr))

		fileName6 = "ID017_clinic_049.Coreference.wech5560.completed.xml"
		taskFile6 = TaskFile(fileName6)
		self.assertEqual(taskFile6.taskName, "ID017_clinic_049")
		self.assertEqual(taskFile6.schemaName, "Coreference")
		self.assertEqual(taskFile6.modeName, None)
		self.assertEqual(taskFile6.annotator, "wech5560")
		self.assertEqual(taskFile6.isAdjudication, False)
		self.assertEqual(taskFile6.isCompleted, True)
		self.assertEqual(taskFile6.isGold, False)
		self.assertEqual(taskFile6.isPreannotation, False)

		fileName7 = "ID017_clinic_049.k.p.i.Coreference.wech5560.completed.xml"
		taskFile7 = TaskFile(fileName7)
		self.assertEqual(taskFile7.taskName, "ID017_clinic_049.k.p.i")
		self.assertEqual(taskFile7.schemaName, "Coreference")
		self.assertEqual(taskFile7.modeName, None)
		self.assertEqual(taskFile7.annotator, "wech5560")
		self.assertEqual(taskFile7.isAdjudication, False)
		self.assertEqual(taskFile7.isCompleted, True)
		self.assertEqual(taskFile7.isGold, False)
		self.assertEqual(taskFile7.isPreannotation, False)

		fileName8 = "ID017_clinic_049.Coreference-Adjudication.wech5560.completed.xml"
		taskFile8 = TaskFile(fileName8)
		self.assertEqual(taskFile8.taskName, "ID017_clinic_049")
		self.assertEqual(taskFile8.schemaName, "Coreference")
		self.assertEqual(taskFile8.modeName, None)
		self.assertEqual(taskFile8.annotator, "wech5560")
		self.assertEqual(taskFile8.isAdjudication, True)
		self.assertEqual(taskFile8.isCompleted, True)
		self.assertEqual(taskFile8.isGold, False)
		self.assertEqual(taskFile8.isPreannotation, False)

		fileName9 = "ID017_clinic_049.Temporal-Entity.wech5560.completed.xml"
		taskFile9 = TaskFile(fileName9)
		self.assertEqual(taskFile9.taskName, "ID017_clinic_049")
		self.assertEqual(taskFile9.schemaName, "Temporal")
		self.assertEqual(taskFile9.modeName, "Entity")
		self.assertEqual(taskFile9.annotator, "wech5560")
		self.assertEqual(taskFile9.isAdjudication, False)
		self.assertEqual(taskFile9.isCompleted, True)
		self.assertEqual(taskFile9.isGold, False)
		self.assertEqual(taskFile9.isPreannotation, False)

		fileName10 = "ID017_clinic_049.Temporal-Entity-Adjudication.wech5560.completed.xml"
		taskFile10 = TaskFile(fileName10)
		self.assertEqual(taskFile10.taskName, "ID017_clinic_049")
		self.assertEqual(taskFile10.schemaName, "Temporal")
		self.assertEqual(taskFile10.modeName, "Entity")
		self.assertEqual(taskFile10.annotator, "wech5560")
		self.assertEqual(taskFile10.isAdjudication, True)
		self.assertEqual(taskFile10.isCompleted, True)
		self.assertEqual(taskFile10.isGold, False)
		self.assertEqual(taskFile10.isPreannotation, False)

		fileName11 = "ID017_clinic_049.Temporal-Entity.wech5560.inprogress.xml"
		taskFile11 = TaskFile(fileName11)
		self.assertEqual(taskFile11.taskName, "ID017_clinic_049")
		self.assertEqual(taskFile11.schemaName, "Temporal")
		self.assertEqual(taskFile11.modeName, "Entity")
		self.assertEqual(taskFile11.annotator, "wech5560")
		self.assertEqual(taskFile11.isAdjudication, False)
		self.assertEqual(taskFile11.isCompleted, False)
		self.assertEqual(taskFile11.isGold, False)
		self.assertEqual(taskFile11.isPreannotation, False)

		fileName12 = "ID017_clinic_049.Temporal-Entity.preannotation.completed.xml"
		taskFile12 = TaskFile(fileName12)
		self.assertEqual(taskFile12.taskName, "ID017_clinic_049")
		self.assertEqual(taskFile12.schemaName, "Temporal")
		self.assertEqual(taskFile12.modeName, "Entity")
		self.assertEqual(taskFile12.annotator, "preannotation")
		self.assertEqual(taskFile12.isAdjudication, False)
		self.assertEqual(taskFile12.isCompleted, True)
		self.assertEqual(taskFile12.isGold, False)
		self.assertEqual(taskFile12.isPreannotation, True)

		fileName13 = "ID017_clinic_049.Temporal-Entity.gold.completed.xml"
		taskFile13 = TaskFile(fileName13)
		self.assertEqual(taskFile13.taskName, "ID017_clinic_049")
		self.assertEqual(taskFile13.schemaName, "Temporal")
		self.assertEqual(taskFile13.modeName, "Entity")
		self.assertEqual(taskFile13.annotator, "gold")
		self.assertEqual(taskFile13.isAdjudication, False)
		self.assertEqual(taskFile13.isCompleted, True)
		self.assertEqual(taskFile13.isGold, True)
		self.assertEqual(taskFile13.isPreannotation, False)
