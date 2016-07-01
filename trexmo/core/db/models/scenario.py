import json
import os
import uuid

from datetime import datetime

from flask import current_app

from trexmo.core.utils.encoders import TrexmoJsonEncoder
from trexmo.core.utils.time import from_unix_timestamp, utcnow

from ..dictionarization import Dictionarizable

from . import Model


class Scenario(Dictionarizable):

    _dictionarizable_attrs = (
        'uid', 'name', 'substance', 'cas', 'created_at', 'description',
        'model', 'determinants'
    )

    def __init__(
            self, uid=None, name=None, substance=None, cas=None,
            description='', created_at=None, model=None, determinants=None):

        self.uid = uid or uuid.uuid4().hex
        self.name = name
        self.substance = substance
        self.cas = cas
        self.description = description
        self.determinants = determinants or {}

        if isinstance(created_at, datetime):
            self.created_at = created_at
        elif isinstance(created_at, int):
            self.created_at = from_unix_timestamp(created_at)
        else:
            self.created_at = utcnow()

        if model:
            # The model field can be an actual instance of Model, or simply a
            # model name.
            if isinstance(model, Model):
                self.model = model
            else:
                model_root = current_app.config['MODELS_ROOT_DIR']
                self.model = Model.get(model_root, model)
        else:
            self.model = None

    def to_dict(self):
        # Don't serialize the model instance, but only its name.
        rv = super().to_dict()
        rv['model'] = self.model.name
        return rv

    def save(self, file):
        json.dump(self.to_dict(), file, sort_keys=True, indent=4, cls=TrexmoJsonEncoder)

        # Update the cache.
        cache_key = (current_app.config['CACHE_KEY_PREFIX'] + 'scenario?' + file.name)
        current_app.cache.set(cache_key, self)

    @classmethod
    def load(cls, file):
        # Look for a copy of the scenario in cache.
        cache_key = (current_app.config['CACHE_KEY_PREFIX'] + 'scenario?' + file.name)
        rv = current_app.cache.get(cache_key)
        if rv is not None:
            return rv

        rv = cls(**json.load(file))

        current_app.cache.set(cache_key, rv)
        return rv

    @classmethod
    def all(cls, directory):
        rv = []
        for filename in os.listdir(directory):
            if not filename.startswith('.'):
                with open(os.path.join(directory, filename), 'r') as f:
                    rv.append(cls.load(f))

        return rv
