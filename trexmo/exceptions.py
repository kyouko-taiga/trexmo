class ApiError(Exception):

    def __init__(self, message, code=400, payload=None):
        Exception.__init__(self)
        self.message = message
        self.code = code
        self.payload = payload
