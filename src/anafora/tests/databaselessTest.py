#from django.test.simple import DjangoTestSuiteRunner
from django.test.runner import DiscoverRunner

class DatabaselessTestRunner(DiscoverRunner):
	"""A test suite runner that does not set up and tear down a database."""

	def setup_databases(self):
		"""Overrides DiscoverRunner"""
		pass

	def teardown_databases(self, *args):
		"""Overrides DiscoverRunner"""
		pass
