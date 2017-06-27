from importlib import import_module
import time

from django.conf import settings
from django.utils.cache import patch_vary_headers
from django.utils.http import cookie_date
import grp

class AnaforaAuthMiddleware(object):
	groupList = None
	grpID = None
	def process_request(self, request):
		if "REMOTE_USER" not in request.META:
			raise Exception("The authentication setting in .htaccess file is incorrect")

		request.META["REMOTE_ADMIN"] = False
		if settings.ANAFORA_AUTH_LDAP:
			if AnaforaAuthMiddleware.grpID == None:
				try:
					AnaforaAuthMiddleware.grpID = grp.getgrnam(settings.ADMIN_GROUPNAME)[2]
				except:
					raise Exception("The setting of 'ADMIN_GROUPNAME' is incorrect")
			if (AnaforaAuthMiddleware.grpID in [g.gr_gid for g in grp.getgrall() if request.META["REMOTE_USER"] in g.gr_mem]):
				request.META["REMOTE_ADMIN"] = True
		else:
			try:
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
