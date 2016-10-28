import argparse
import subprocess
import os

from trexmo.factory import create_app


class Command():

    def __init__(self, argv, **kwargs):
        self.argv = argv

    def __call__(self):
        # Change the current directory to the root of the gui sources.
        root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        gui_dir = os.path.join(root_dir, 'app', 'gui')
        os.chdir(gui_dir)

        # Initialize the command parser and create the subcommands.
        parser = argparse.ArgumentParser(
            prog=self.argv[0],
            description='Manage the gui.')
        subparsers = parser.add_subparsers(dest='subcommand')
        subparsers.required = True

        sub = subparsers.add_parser(
            'install', help=(
                'Install the gui dependencies in trexmo/app/gui/node_modules.'
            ))

        sub = subparsers.add_parser(
            'build', help='Build the gui from source.')
        sub.add_argument(
            '-d', '--debug', dest='debug', action='store_true',
            help='Build non-minified files for debug.')

        sub = subparsers.add_parser(
            'watch', help=(
                'Watch the gui source files and rebundle them when a change '
                'is detected. Note that this command always build non-minified '
                'files.'
            ))

        sub = subparsers.add_parser('clean', help='Clean the generated files.')

        # Parse and execute the command line.
        args = parser.parse_args(self.argv[1:])

        if args.subcommand == 'install':
            # Instal the frontend dependencies with npm.
            subprocess.check_call('npm install --python=python2.7', shell=True)

            # Create a symlink named `trexmo` to the sources directory (`src`)
            # into `node_modules`, so that we can avoid relative path hell in
            # the frontend source files.
            try:
                os.symlink(
                    os.path.join(gui_dir, 'src'),
                    os.path.join(gui_dir, 'node_modules', 'trexmo'))
            except FileExistsError:
                pass

            # Make sure static/build exists
            js_dir = os.path.join(root_dir, 'app', 'static', 'build')
            if not os.path.exists(js_dir):
                os.makedirs(js_dir)

        elif args.subcommand == 'build':
            if args.debug:
                subprocess.check_call('npm run build-debug', shell=True)
            else:
                subprocess.check_call('npm run build', shell=True)

        elif args.subcommand == 'clean':
            subprocess.check_call('npm run clean', shell=True)

        elif args.subcommand == 'watch':
            try:
                subprocess.check_call('npm run watch', shell=True)
            except KeyboardInterrupt:
                pass
