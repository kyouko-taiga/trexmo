# This file is part of Socialease.
# Copyright (c) 2014-2015 Socialease LLC. All rights reserved.

from flask import current_app


class Cached(object):

    @classmethod
    def load_from_cache(cls, file):
        # Note that we can't decorate this method with flask_cache.memoize
        # because it can be loaded outside of an application context.
        if current_app.config['USE_CACHE_FOR_DDTL']:
            cache_key = (
                current_app.config['CACHE_KEY_PREFIX'] + cls.__name__ + '.load?' + file.name)
            rv = current_app.cache.get(cache_key)
            if rv is not None:
                return rv

        return None

    @classmethod
    def save_to_cache(cls, file, obj):
        if current_app.config['USE_CACHE_FOR_DDTL']:
            cache_key = (
                current_app.config['CACHE_KEY_PREFIX'] + cls.__name__ + '.load?' + file.name)
            current_app.cache.set(cache_key, obj)
