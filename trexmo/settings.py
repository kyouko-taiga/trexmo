import os


basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

# SQLAlchemy
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'data', 'trexmo.db')

# Caching
CACHE_BACKEND = 'Redis'
CACHE_CONFIG = {
    'host': 'localhost',
    'port': 6379,
    'password': None,
    'db': 0,
    'default_timeout': 300
}

# Authentication
SECRET_KEY = '108-e08-c20'
AUTH_TOKEN_DURATION = 86400

DATA_DIR          = os.path.join(basedir, 'data')
MODELS_ROOT_DIR   = os.path.join(DATA_DIR, 'models')
FORMS_ROOT_DIR    = os.path.join(DATA_DIR, 'forms')
TRANS_ROOT_DIR    = os.path.join(DATA_DIR, 'translations')
SCENARII_ROOT_DIR = os.path.join(DATA_DIR, 'scenarii')

CACHE_DIR         = os.path.join(basedir, 'build')
