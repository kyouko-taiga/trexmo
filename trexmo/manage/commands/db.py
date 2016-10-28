import argparse

from trexmo.core.db.utils import db_sync
from trexmo.factory import create_app


class Command():

    def __init__(self, argv, **kwargs):
        self.argv = argv

    def __call__(self):
        # Create an application context.
        app = create_app(__name__, [])
        ctx = app.test_request_context()
        ctx.push()

        # Initialize the command parser and create the subcommands.
        parser = argparse.ArgumentParser(
            prog=self.argv[0],
            description='Manage the database.')
        subparsers = parser.add_subparsers(dest='subcommand')
        subparsers.required = True

        subparsers.add_parser('sync', help='Synchronize the database.')

        # Parse and execute the command line.
        args = parser.parse_args(self.argv[1:])
        if args.subcommand == 'sync':
            db_sync()

        ctx.pop()
