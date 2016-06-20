import argparse
import importlib
import os
import pkgutil
import sys


def find_commands(package_path):
    """Returns a list of the command names that are available.

    :param package_path: the path of the command package
    """
    command_path = os.path.join(package_path, 'commands')
    return [name for _, name, is_pkg in pkgutil.iter_modules([command_path])
            if not is_pkg and not name.startswith('_')]

def load_command(package_name, command_name):
    """Load the management class of the given command.

    :param package_name: the name of the command package
    :param command_name: the name of the command
    """
    m = importlib.import_module('%s.commands.%s' % (package_name, command_name))
    return m.Command

def load_commands(package_path, package_name):
    """Returns a dictionary mapping command names to their management class.

    :param package_path: the path of the command package
    :param package_name: the name of the command package
    """
    return {cn: load_command(package_name, cn) for cn in find_commands(package_path)}

class Manage(object):

    def __init__(self, version='0.1', argv=None):
        self.argv = argv or sys.argv[:]
        self.version = version
        self.prog_name = os.path.basename(self.argv[0])

    def main_help_text(self):
        usage = [
            "",
            "This is the command line management interface for Mushi.",
            "Type '%s <subcommand>' for help on a specific subcommand." % self.prog_name,
            "",
            "Available subcommands:"
        ]

        subcommands = sorted(find_commands(__path__[0]));
        usage.append(', '.join(subcommands))

        return '\n'.join(usage)

    def __call__(self):
        # Check if there are enough arguments
        if len(self.argv) < 2:
            print(self.main_help_text())
            return 0

        subcommand = self.argv[1]

        # Handle optional arguments --version and --help
        if subcommand.startswith('-'):
            if subcommand in ['-v', '--version']:
                print('%s version %s' % (self.prog_name, self.version))
            elif subcommand in ['-h', '--help']:
                print(self.main_help_text())
            else:
                print("unkown option '%s'" % subcommand)
                return -1
            return 0

        # Execute the subcommand
        try:
            getattr(self, self.argv[1])()
        except AttributeError as e:
            print("unkown command '%s'" % subcommand)
            return -1

    def __getattr__(self, command_name):
        return load_command(__name__, command_name)(self.argv[1:])
