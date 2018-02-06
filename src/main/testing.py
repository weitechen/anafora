"""Support for testing."""

from django.test import TestCase
#from unittest import TestCase


#class DatabaselessTestRunner(TestCase):
class AnimalTestCase(TestCase):
    """A test suite runner that does not set up and tear down a database."""

    def setUp(self):
        pass

    def runTest(self):
        pass

    def test_running(self):
        self.assertTrue(True)
