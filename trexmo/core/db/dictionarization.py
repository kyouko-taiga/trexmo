# This file is part of Socialease.
# Copyright (c) 2014-2015 Socialease LLC. All rights reserved.

from collections import Mapping, Set, Sequence
from six import string_types


class Dictionarizable(object):

    @classmethod
    def dictionarizable_attrs(cls):
        rv = set(cls._dictionarizable_attrs) if hasattr(cls, '_dictionarizable_attrs') else set()
        for base in cls.__bases__:
            if hasattr(base, 'dictionarizable_attrs'):
                rv.update(base.dictionarizable_attrs())
        return rv

    def to_dict(self):
        return dictionarize(self)


def dictionarize(model):
    """
    :warning:
        Calling this function on models that have cycle references will result
        in a recusrion error.
    """
    rv = {}

    # Return "as is" the objects that don't inherit from dictionarizable.
    if not isinstance(model, Dictionarizable):
        return model

    # Loop through the columns attributes.
    fields = ((f, getattr(model, f)) for f in model.dictionarizable_attrs())

    for key, value in fields:
        if isinstance(value, Mapping):
            rv[key] = {k: dictionarize(v) for k, v in value.items()}
        elif isinstance(value, (Set, Sequence)) and not isinstance(value, string_types):
            rv[key] = list(dictionarize(v) for v in value)
        else:
            rv[key] = dictionarize(value)

    return rv
