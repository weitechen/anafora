"""Support for testing."""

from django.test import TestCase


class DatabaselessTestRunner(TestCase):
    """A test suite runner that does not set up and tear down a database."""

    def setUp(self):
        pass
