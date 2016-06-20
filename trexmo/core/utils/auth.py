import binascii
import os

from datetime import timedelta
from functools import wraps

from flask import current_app, request

from trexmo.core.exc import ExpiredTokenError, InvalidTokenError
from trexmo.core.db import db_session
from trexmo.core.db.models import Token

from .time import utcnow


def validate_token(token):
    """Verify the given authentication token.

    :raises ~trexmo.core.exc.InvalidTokenError:
        if the given token is invalid.
    :raises ~trexmo.core.exc.ExpiredTokenError:
        if the given token expired.
    """
    if token is None:
        raise InvalidTokenError()
    if token.has_expired:
        raise ExpiredTokenError()
    return True


def parse_auth_token():
    """Return the authentication token attached to the request.

    This function tries to retrieve the authentication token attached to the
    request by. It first looks for `X-Auth-Token` in the request headers. If
    no such header could be found, it checks for `Auth-Token` in the request
    cookies.

    If none of these locations contains an authentication token, or the given
    token value doesn't match any existing token, the return value is None.
    """
    token_value = request.headers.get('X-Auth-Token', request.cookies.get('Auth-Token'))
    return db_session.query(Token).filter(Token.value == token_value).first()


def require_auth_token(f):
    """A decorator that is used on views to ensure that a valid authentication
    token was attached to the request. The decorated function is called with
    the obtained authentication token as an additional argument.

    .. note::
        If the token is missing or invalid, the decorator raises
        :class:`InvalidTokenError` and does not call the decorated function.
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        # Get and validate the auth token
        token = parse_auth_token()
        validate_token(token)

        # Append the auth token to the function arguments and call it.
        kwargs['auth_token'] = token
        return f(*args, **kwargs)

    return wrapper


def make_auth_token(auth_user):
    """Generates an authentication token for the given user."""
    new_token = Token()
    new_token.value = str(binascii.hexlify(os.urandom(32)).decode())
    new_token.expires_at = utcnow() + timedelta(seconds=current_app.config['AUTH_TOKEN_DURATION'])

    # Associate the new token to the given user.
    auth_user.tokens.append(new_token)

    db_session.commit()
    return new_token
