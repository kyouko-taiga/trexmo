import os

from flask import Flask
from flask_cache import Cache

from sqlalchemy import create_engine

from .core.db import db_session
from .core.utils.app import register_blueprints


def remove_db_session(exception=None):
    db_session.remove()


def create_app(package_name, package_path, debug=False):
    """Returns a :class:`Flask` application instance.
    :param package_name: application package name
    :param package_path: application package path
    :param debug: the debug flag
    """
    app = Flask(package_name, instance_relative_config=True)

    app.config.from_object('trexmo.settings')
    app.config.from_envvar('TREXMO_SETTINGS', silent=True)

    if debug:
        app.debug = debug

    app.db_engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
    app.teardown_appcontext(remove_db_session)

    app.cache = Cache(app, config=app.config)

    register_blueprints(app, package_name, package_path)
    return app
