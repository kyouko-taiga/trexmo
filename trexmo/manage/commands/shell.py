import code

from trexmo.factory import create_app


class Command(object):

    def __init__(self, *args, **kwargs):
        pass

    def __call__(self):
        # Create an application context
        app = create_app(__name__, [])
        ctx = app.test_request_context()
        ctx.push()

        # Set up a dictionary to serve as the environment for the shell
        imported_objects = {}

        # Try activating rlcompleter
        try: 
            import readline
        except ImportError:
            pass
        else:
            import rlcompleter
            readline.set_completer(rlcompleter.Completer(imported_objects).complete)
            readline.parse_and_bind("tab:complete")

        code.interact(local=imported_objects)
