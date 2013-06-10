"""Support for testing."""

from django.test.simple import DjangoTestSuiteRunner
from django.test.testcases import TransactionTestCase
from django.test import TestCase


class DatabaselessTestRunner(DjangoTestSuiteRunner):
    """A test suite runner that does not set up and tear down a database."""

    def setup_databases(self):
        """Overrides DjangoTestSuiteRunner"""
        pass

    def teardown_databases(self, *args):
        """Overrides DjangoTestSuiteRunner"""
        pass

