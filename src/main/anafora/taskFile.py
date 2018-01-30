#!/usr/bin/env python

from django.core.exceptions import ValidationError

class TaskFile(object):
	"""
	Processes task file with file name
	"""
	formatStr = "Correct filename format should be '$taskName.$schemaName(?-modeName)(?-Adjudication).$annotator.(completed/inpgrogress).xml'"
	def __init__(self, fileName):
		"""
		@type fileName:			str
		
		@type taskName:			str
		@type schemaName:		str
		@type modeName:			str
		@type annotator:		str
		@type isCompleted:		bool
		@type isPreannotation:	bool
		@type isGold:			bool
		@type isAdjudication:	bool
		"""
		self.taskName = ""
		self.schemaName = ""
		self.modeName = None
		self.annotator = ""
		self.isCompleted = False
		self.isPreannotation = False
		self.isGold = False
		self.isAdjudication = False

		if len(fileName) <= 4 or fileName[-4:] != ".xml":
			raise ValidationError, "XML File format error ('%s'). %s" % (str(fileName), TaskFile.formatStr)
		if fileName.count('.') <= 3:
			raise ValidationError, "XML File format error ('%s'), should be '$taskName.$schemaName.$annotator.(completed/inpgrogress).xml'" % (str(fileName))

		taskTerms = fileName.split('.')
		if taskTerms[-2] == "completed":
			self.isCompleted = True
		elif taskTerms[-2] == "inprogress":
			pass
		else:
			raise ValidationError, "XML File format error ('%s'): please check the value of 'completed/inprogress'. %s" % (str(fileName), TaskFile.formatStr)

		self.annotator = taskTerms[-3]
		if self.annotator == "preannotation":
			self.isPreannotation = True
		elif self.annotator == "gold":
			self.isGold = True

		schema = taskTerms[-4]
		schemaTerm = schema.split("-")
		if len(schemaTerm) == 1:
			self.schemaName = schema
		elif len(schemaTerm) == 2:
			self.schemaName = schemaTerm[0]
			if schemaTerm[1] == "Adjudication":
				self.isAdjudication = True
			else:
				self.modeName = schemaTerm[1]
		elif len(schemaTerm) == 3:
			if schemaTerm[2] != "Adjudication":
				raise ValidationError, "XML File format error ('%s'): please check the value of your adjudication indicator. %s" % (str(fileName), TaskFile.formatStr)
			self.schemaName = schemaTerm[0]
			self.modeName = schemaTerm[1]
			self.isAdjudication = True
		else:
			raise ValidationError, "XML File format error ('%s'). %s" % (str(fileName), TaskFile.formatStr)

		self.taskName = reduce(lambda x,y: '%s.%s' % (x,y), taskTerms[:-4])
