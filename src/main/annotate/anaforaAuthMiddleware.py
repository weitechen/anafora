from importlib import import_module
import time

from django.conf import settings
from django.utils.cache import patch_vary_headers
from django.utils.http import cookie_date

class AnaforaAuthMiddleware(object):
	groupList = None
	def process_request(self, request):
		try:
			request.META["REMOTE_ADMIN"] = False
			#print 'requesting group file'
			groupFile = settings.GROUP_FILE
			if AnaforaAuthMiddleware.groupList == None:
				fhd = open(groupFile)
				for line in fhd.xreadlines():
					term = line.split(":")
					if term[0].strip() == settings.ADMIN_GROUPNAME:
						AnaforaAuthMiddleware.groupList = [t.strip() for t in term[1].split(" ") if t.strip() != ""]
						break
				fhd.close()
		except:
			raise
		
		if AnaforaAuthMiddleware.groupList != None and request.META["REMOTE_USER"] in AnaforaAuthMiddleware.groupList:
			request.META["REMOTE_ADMIN"] = True

	def process_response(self, request, response):
		return response
