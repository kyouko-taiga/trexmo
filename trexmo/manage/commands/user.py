import argparse

from getpass import getpass

from passlib.hash import pbkdf2_sha256

from trexmo.core.db import db_session
from trexmo.core.db.models import User
from trexmo.core.exc import InvalidArgumentError
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
            description="Manage the user accounts.")
        subparsers = parser.add_subparsers(dest='subcommand')
        subparsers.required = True

        subparsers.add_parser('list', help='List users.')

        sub = subparsers.add_parser('add', help='Add an user.')
        sub.add_argument('username', action='store', help="The username of the user.")
        sub.add_argument(
            '-p', '--password', dest='password', action='store',
            help='The password of the user (will be asked if not provided).')
        sub.add_argument(
            '-r', '--root', dest='root', action='store_true',
            help='A flag that indicates if the user is a root.')

        sub = subparsers.add_parser('delete', help='Delete a user.')
        sub.add_argument('username', action='store', help="The username of the user.")

        # Parse and execute the command line.
        args = parser.parse_args(self.argv[1:])

        if args.subcommand == 'list':
            for user in User.query:
                print('%s: %s%s' % (user.uid, user.username, ' (root)' if user.root else ''))

        elif args.subcommand == 'add':
            # Create the new user record.
            new_user = User(username=args.username)

            # Ask for password unless provided.
            if args.password:
                password = args.password
            else:
                password = getpass('password: ')
                if getpass('confirm: ') != password:
                    raise InvalidArgumentError('Password do not match.')
            new_user.password = pbkdf2_sha256.encrypt(password)

            # Set the user as a root if needed.
            new_user.root = args.root

            # Add the user the the database.
            db_session.add(new_user)
            db_session.commit()

        elif args.subcommand == 'delete':
            user = User.query.filter(User.username == args.username).one()
            db_session.delete(user)
            db_session.commit()

        ctx.pop()
