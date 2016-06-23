import json
import os
import uuid

from flask import current_app

from trexmo.core.utils.time import utcnow

from ..dictionarization import Dictionarizable

from . import Model


class Scenario(Dictionarizable):

    _dictionarizable_attrs = (
        'uid', 'name', 'substance', 'cas', 'created_at', 'description',
        'model', 'determinants'
    )

    def __init__(
            self, uid=None, name=None, substance=None, cas=None,
            created_at=None, model=None, determinants=None):

        self.uid = uid or uuid.uuid4().hex
        self.name = name
        self.substance = substance
        self.cas = cas
        self.created_at = created_at or utcnow()
        self.description = description
        self.determinants = determinants or {}

        if model:
            # The model field can be an actual instance of Model, or simply a
            # model name.
            if isinstance(model, Model):
                self.model = model
            else:
                model_root = current_app.config['MODELS_ROOT_DIR']
                with open(os.path.join(model_root, model), 'r') as f:
                    self.model = Model.load(f)
        else:
            self.model = None

    @classmethod
    def load(cls, file):
        return cls(**json.load(file))

    @classmethod
    def all(cls, directory):
        rv = []
        for filename in os.listdir(directory):
            if not filename.startswith('.'):
                with open(os.path.join(directory, filename), 'r') as f:
                    rv.append(cls.load(f))
        return rv
