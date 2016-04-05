import yaffel.datatypes
import yaml

from datetime import datetime

from collections import OrderedDict
from flask.json import JSONEncoder

from trexmo.db.models.determinant import Determinant

def ordered_load(stream, Loader=yaml.Loader, object_pairs_hook=OrderedDict):
    """Helper function to load Yaml dictionaries into an OrderedDict."""
    class OrderedLoader(Loader):
        pass

    def construct_mapping(loader, node):
        loader.flatten_mapping(node)
        return object_pairs_hook(loader.construct_pairs(node))

    OrderedLoader.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, construct_mapping)
    return yaml.load(stream, OrderedLoader)

class YaffelJsonEncoder(JSONEncoder):

    def default(self, obj):
        try:
            if isinstance(obj, yaffel.datatypes.Enumeration):
                return {
                    'type': type(obj).__module__ + '.' + type(obj).__name__,
                    'elements': obj.elements
                }
            if isinstance(obj, yaffel.datatypes.Range):
                return {
                    'type': type(obj).__module__ + '.' + type(obj).__name__,
                    'lower_bound': obj.lower_bound,
                    'upper_bound': obj.upper_bound
                }
            iterable = iter(obj)
        except TypeError:
            pass
        else:
            return list(iterable)

        return JSONEncoder.default(self, obj)

class TrexmoJsonEncoder(YaffelJsonEncoder):

    def default(self, obj):
        if isinstance(obj, Determinant):
            return self.encode(obj.value)
        return YaffelJsonEncoder.default(self, obj)
