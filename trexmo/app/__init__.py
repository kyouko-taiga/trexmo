from flask import jsonify, request, render_template

from trexmo import factory
from trexmo.core.exc import InvalidTokenError
from trexmo.core.utils.encoders import TrexmoJsonEncoder


def create_app(debug=False):
    """Return an instance of a TREXMO web application."""
    app = factory.create_app(__name__, __path__, debug)

    # Set the default json encoder.
    app.json_encoder = TrexmoJsonEncoder

    # Register the custom Jinja filters.
    app.template_filter(equal_or_in)

    # Register the error handlers.
    @app.errorhandler(InvalidTokenError)
    def handle_auth_error(error):
        if not request.is_xhr:
            return render_template('not-logged-in.html')
        else:
            return jsonify({'error': 'forbidden'}), 403

    return app


def equal_or_in(x,y):
    try:
        return x == y
    except:
        return x in y
