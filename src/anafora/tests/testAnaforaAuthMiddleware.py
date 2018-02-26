import os, sys
from ..anaforaAuthMiddleware import *

class TestAnaforaAuthMiddleware(AnaforaAuthMiddleware):
	def __init__(self):
		super(TestAnaforaAuthMiddleware, self).__init__()
	
	def process_request(self, request):
		super(TestAnaforaAuthMiddleware, self).process_request(request)

		if request.META["REMOTE_USER"] == "admin":
			request.META["REMOTE_ADMIN"] = True
