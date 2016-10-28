from sqlalchemy.ext.declarative import declarative_base

from .. import db_session


Base = declarative_base()
Base.session = db_session
Base.query = db_session.query_property()
