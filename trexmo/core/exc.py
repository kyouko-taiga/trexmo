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


class ApiError(TrexmoError):

    def __init__(self, message, code=400, payload=None):
        Exception.__init__(self)
        self.message = message
        self.code = code
        self.payload = payload
