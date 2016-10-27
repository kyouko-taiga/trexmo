import argparse

from trexmo.factory import create_app


class Command():

    def __init__(self, argv, **kwargs):
        pass

    def __call__(self):
        app = create_app(__name__, [])
        with app.app_context():
            app.cache.clear()
