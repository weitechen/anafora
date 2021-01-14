import sys, os
from os.path import dirname
#Django settings for web project.

BASE_DIR = dirname(dirname(dirname(__file__)))
PASS_DIR = dirname('/var/www/private/')

DEBUG = False
TEMPLATE_DEBUG = DEBUG
DJANGO_LOG_LEVEL = DEBUG

ADMINS = (
    # ('Your Name', 'your_email@example.com'),
)

MANAGERS = ADMINS

#DATABASES = {
#    'default': {
#        'ENGINE': 'django.db.backends.', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
#        'NAME': '',                      # Or path to database file if using sqlite3.
#        'USER': '',                      # Not used with sqlite3.
#        'PASSWORD': '',                  # Not used with sqlite3.
#        'HOST': '',                      # Set to empty string for localhost. Not used with sqlite3.
#        'PORT': '',                      # Set to empty string for default. Not used with sqlite3.
#    }
#}
DATABASES = {'default':{}}

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'America/Los_Angeles'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = ''

# URLthat handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = ''

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
# STATIC_ROOT = ''

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
# STATIC_ROOT = '/home/anafora/git/anafora/static'
STATIC_ROOT = os.path.join(BASE_DIR,'static')
#STATIC_ROOT = '/data/home/verbs/student/wech5560/Research/TemporalPreAnnotation/main/StaticFiles'
STATIC_URL = '/static/'
# STATIC_URL = '/anafora/static/'

# ROOT_URL = '/anafora'
ROOT_URL = ''

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    # '',
    # '/home/anafora/git/anafora/src/static',
    os.path.join(BASE_DIR,'src/static'),
    )
#    /data/home/verbs/student/wech5560/Research/anaforaDevelop/src/main/static',
#    '/data/home/verbs/student/wech5560/Research/anaforaDevelop/src/main/static/css',
#    '/data/home/verbs/student/wech5560/Research/anaforaDevelop/src/main/static/js',
#    '/data/home/verbs/student/wech5560/Research/anaforaDevelop/src/main/static/image',
#)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
with open(os.path.join(PASS_DIR,'anafora_django_secret.txt')) as f:
    SECRET_KEY = f.read().strip()

# 22May2017 Petr Janata - added TEMPLATES definition that newer versions of Django expect
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR,'src/Templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                # Already defined Django-related contexts here
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# List of callables that know how to import templates from various sources.
#TEMPLATE_LOADERS = (
#    'django.template.loaders.filesystem.Loader',
#    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
#)

#TEMPLATE_CONTEXT_PROCESSORS = (
#    'django.core.context_processors.static',
#    'django.core.context_processors.request',
#)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
#    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
#    'django.contrib.auth.middleware.AuthenticationMiddleware',
#    'django.contrib.messages.middleware.MessageMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # Uncomment the next line for Anafora digest auth
    'anafora.anaforaAuthMiddleware.AnaforaAuthMiddleware',
)

ROOT_URLCONF = 'web.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'web.wsgi.application'

TEMPLATE_DIRS = (
    # "/home/anafora/git/anafora/src/Templates",
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
#    'django.contrib.sessions',
#    'django.contrib.sites',
#    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Uncomment the next line to enable the admin:
    # 'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    # 'django.contrib.admindocs',
    #'markFalsePositive',
    #'django_qunit',
    # 'annotate',
    'anafora',
)

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'formatters': {
        'timestamped': {
            'format': '%(levelname)s %(asctime)s %(funcName)s %(pathname)s %(lineno)s %(message)s',
        },
    },    
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        },
        'errorfile': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': '/home/anafora/log/django-error.txt',
        },
        'debugfile': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': '/home/anafora/log/django-debug.txt',
            'formatter': 'timestamped',
        },
        'django-all': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': '/home/anafora/log/django-all.txt',
            'formatter': 'timestamped',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['django-all'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'django.request': {
            'handlers': ['mail_admins','errorfile'],
            'level': 'ERROR',
            'propagate': True,
        },
        'django.request': {
            'handlers': ['debugfile'],
            'level': 'DEBUG',
            'propagate': True,
        }
    }
}

TEST_RUNNER = 'testing.DatabaselessTestRunner'

# Assign the anafora project file directory path
#ANAFORA_PROJECT_FILE_ROOT = ""
ANAFORA_PROJECT_FILE_ROOT = "/home/anafora/projects"

# Assign the setting file in the project directory
ANAFORA_PROJECT_SETTING_FILENAME = ".setting.xml"

# Assign the Digest auth group file location
GROUP_FILE = '/home/anafora/http/anafora.authgroup'
#GROUP_FILE = '/data/anafora-event/site/anafora-event.group'

ANAFORA_AUTH_LDAP = None

# Assign the group name for the admin
ADMIN_GROUPNAME = 'anaforaadmin'

ALLOWED_HOSTS = ['anafora.cmb.ucdavis.edu']
