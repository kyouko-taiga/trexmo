import yaml

from collections import OrderedDict


def ordered_loader(stream, Loader=yaml.Loader, object_pairs_hook=OrderedDict):
    """Helper function to load Yaml dictionaries into an OrderedDict."""
    class OrderedLoader(Loader):
        pass

    def construct_mapping(loader, node):
        loader.flatten_mapping(node)
        return object_pairs_hook(loader.construct_pairs(node))

    OrderedLoader.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, construct_mapping)
    return yaml.load(stream, OrderedLoader)

