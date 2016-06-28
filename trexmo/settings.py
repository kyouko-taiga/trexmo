import os


basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

# SQLAlchemy
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'data', 'trexmo.db')

# Caching
CACHE_TYPE = 'redis'
CACHE_KEY_PREFIX = 'trxm-'
CACHE_DEFAULT_TIMEOUT = 300
CACHE_REDIS_HOST = 'localhost'
CACHE_REDIS_PORT = 6379
CACHE_REDIS_PASSWORD = None
CACHE_REDIS_DB = 0

# Authentication
SECRET_KEY = '108-e08-c20'
AUTH_TOKEN_DURATION = 86400

DATA_DIR = os.path.join(basedir, 'data')
MODELS_ROOT_DIR = os.path.join(DATA_DIR, 'models')
FORMS_ROOT_DIR = os.path.join(DATA_DIR, 'forms')
TRANS_ROOT_DIR = os.path.join(DATA_DIR, 'translations')
SCENARII_ROOT_DIR = os.path.join(DATA_DIR, 'scenarii')

CACHE_DIR = os.path.join(basedir, 'build')
