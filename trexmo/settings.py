import os


basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

# SQLAlchemy
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'data', 'trexmo.db')

DATA_DIR          = os.path.join(basedir, 'data')
MODELS_ROOT_DIR   = os.path.join(DATA_DIR, 'models')
FORMS_ROOT_DIR    = os.path.join(DATA_DIR, 'forms')
TRANS_ROOT_DIR    = os.path.join(DATA_DIR, 'translations')
SCENARII_ROOT_DIR = os.path.join(DATA_DIR, 'scenarii')

CACHE_DIR         = os.path.join(basedir, 'build')
