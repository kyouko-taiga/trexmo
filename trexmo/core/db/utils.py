from flask import current_app

# All models should be imported beore db_sync is called, so that they can be
# registered propertly on the Base metadata.
from . import models
from . import db_session


def db_sync():
    """Synchronize the database state with the current set of models."""
    models.Base.metadata.create_all(bind=current_app.db_engine)
