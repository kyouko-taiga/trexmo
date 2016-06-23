from werkzeug.contrib.cache import RedisCache

from trexmo import factory
from trexmo.core.utils.encoders import TrexmoJsonEncoder


def make_cache(config):
    backend = config.get('CACHE_BACKEND')
    cache_config = config.get('CACHE_CONFIG', {})

    if backend == 'Redis':
        return RedisCache(**cache_config)

    # Currently, only RedisCache is supported.
    raise ValueError("Unsupported cache backend: '%s'" % backend)


def create_app(debug=False):
    """Return an instance of a TREXMO web application."""
    app = factory.create_app(__name__, __path__, debug)

    # Create the app cache.
    app.cache = make_cache(app.config)

    # Set the default json encoder
    app.json_encoder = TrexmoJsonEncoder

    # Register the custom Jinja filters
    app.template_filter(equal_or_in)

    return app


def equal_or_in(x,y):
    try:
        return x == y
    except:
        return x in y
