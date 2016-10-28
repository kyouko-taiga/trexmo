from sqlalchemy.orm import scoped_session, create_session

from flask import current_app


db_session = scoped_session(
    lambda: create_session(bind=current_app.db_engine, autocommit=False, autoflush=False))


def db_sync():
    from sqlalchemy import DDL, event

    # Import all modules here that might define models so that
    # they will be registered properly on the metadata. Otherwise
    # you will have to import them first before calling db_sync()
    import mushi.core.db.models

    event.listen(
        mushi.core.db.models.Issue.__table__,
        'after_create',
        DDL('ALTER TABLE %(table)s AUTO_INCREMENT = 1;').execute_if(
            dialect=('postgresql', 'mysql'))
    )

    models.Base.metadata.create_all(bind=current_app.db_engine)
