import datetime, uuid

class Scenario(object):

    def __init__(self, **kwargs):
        self.id          = uuid.uuid1().hex
        self.name        = kwargs.get('name', None)
        self.substance   = kwargs.get('substance', None)
        self.cas         = kwargs.get('cas', None)
        self.created_at  = kwargs.get('created_at', datetime.datetime.now())
        self.description = kwargs.get('description', '')
        self.model       = kwargs.get('model', None)
        self.data        = {}
