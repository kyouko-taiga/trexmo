import argparse

from trexmo.app import create_app


class Command():

    def __init__(self, argv, **kwargs):
        self.argv = argv

    def __call__(self):
        parser = argparse.ArgumentParser(
            prog=self.argv[0],
            description='Manage the Mushi server.')
        subparsers = parser.add_subparsers(dest='subcommand')
        subparsers.required = True

        # create a sub-parser for the run method
        sub = subparsers.add_parser('run', help='run the server')
        sub.add_argument('-p', '--port', dest='port', action='store', type=int, default=5000,
            help='specify the listening port (default: 5000)')
        sub.add_argument('-o', '--host', dest='host', action='store', default='localhost',
            help='specify the hostname to listen on (default: localhost)')
        sub.add_argument('-d', '--debug', dest='debug', action='store_true',
            help='start the server in debug mode')

        args = parser.parse_args(self.argv[1:])
        if args.subcommand == 'run':
            app = create_app(debug=args.debug)
            app.run()
