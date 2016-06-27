from functools import wraps

from flask import current_app, request

from itsdangerous import BadSignature, SignatureExpired, TimestampSigner

from trexmo.core.exc import ExpiredTokenError, InvalidTokenError


def parse_auth():
    """Parse the authentication token attached to the request.

    This function tries to retrieve the authentication token attached to the
    request by. It first looks for `X-Auth-Token` in the request headers. If
    no such header could be found, it checks for `Auth-Token` in the request
    cookies.

    The function returns the owner UID associated with the token attached to
    the request, or raises an exception if none of these locations contains a
    valid one.

    :raises ~trexmo.core.exc.InvalidTokenError:
        if the given token is missing or invalid.
    :raises ~trexmo.core.exc.ExpiredTokenError:
        if the given token expired.
    """
    auth_token = request.headers.get('X-Auth-Token', request.cookies.get('Auth-Token'))

    if auth_token is None:
        raise InvalidTokenError()

    signer = TimestampSigner(current_app.secret_key)

    try:
        auth = signer.unsign(auth_token, max_age=current_app.config['AUTH_TOKEN_DURATION'])
    except BadSignature:
        raise InvalidTokenError()
    except SignatureExpired:
        raise ExpiredTokenError()

    return auth.decode()


def require_auth(f):
    """A decorator that is used on views to ensure that a valid authentication
    token was attached to the request. The decorated function is called with
    the user UID obtained from the token as an additional argument.

    .. note::
        The decorator raises a token exception if the authentication token is
        either missing or invalid, without calling the decorated function.
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        # Get and validate the auth token.
        auth = parse_auth()

        # Append the owner UID to the function arguments and call it.
        kwargs['auth'] = auth
        return f(*args, **kwargs)

    return wrapper


def make_auth_token(auth_user):
    """Generates an authentication token for the given user."""
    signer = TimestampSigner(current_app.secret_key)
    return signer.sign(str(auth_user.uid)).decode()
