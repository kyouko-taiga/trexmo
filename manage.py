import argparse, sys

from trexmo import app, settings
from trexmo.db.models import FormDescription, ModelDescription, TranslationDescription

class Main(object):

    def __call__(self):
        # parse the sub-command
        parser = argparse.ArgumentParser(
            description='Command line interface for mikata server.',
            usage='''%(prog)s [-h] [-v] command [args ...]

The commands are:
    run             run the server
''')
        parser.add_argument('-v', '--version', action='version', version='%(prog)s version 0.1')
        parser.add_argument('command', help='sub-command to execute')

        args = parser.parse_args(sys.argv[1:2])
        if not hasattr(self, args.command):
            parser.error('unrecognized command "%s"' % args.command)
        getattr(self, args.command)()

    def run(self):
        # Parse the sub-command arguments
        parser = argparse.ArgumentParser(prog='manage.py run')
        parser.add_argument('-p', '--port', dest='port', action='store', type=int, default=5000,
            help='specify the listening port (default: 5000)')
        parser.add_argument('-o', '--host', dest='host', action='store', default='127.0.0.1',
            help='specify the hostname to listen on (default: 127.0.0.1)')
        parser.add_argument('-d', '--debug', dest='debug', action='store_true',
            help='start the server in debug mode')
        args = parser.parse_args(sys.argv[2:])

        # Run the server
        app.run(debug=args.debug, port=args.port, host=args.host)

main = Main()

if __name__ == '__main__':
    main()
