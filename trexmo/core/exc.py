class TrexmoError(Exception):
    """Generic error class."""


class AuthenticationError(TrexmoError):
    """Raised when an error related to authentication occured."""


class InvalidCredentialsError(AuthenticationError):
    """Raised when an authentication failed due to invalid credentials."""


class InvalidTokenError(AuthenticationError):
    """Raised when an authentication token failed validation."""


class ExpiredTokenError(InvalidTokenError):
    """Raised when an authentication token expired."""


class InvalidArgumentError(TrexmoError):
    """Raised when a function or method is called with invalid arguments."""

    def __init__(self, message=None):
        self.message = message


class YaffelEvalError(TrexmoError):
    """Raised when the evaluation of a yaffel expression failed."""

    def __init__(self, expression=None, message=None):
        self.expression = expression
        self.message = message
