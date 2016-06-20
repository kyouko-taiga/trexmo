import os

from flask import Flask

from .core.utils.app import register_blueprints


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

    register_blueprints(app, package_name, package_path)
    return app
