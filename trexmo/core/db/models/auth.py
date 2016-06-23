import uuid

from sqlalchemy import Column, Integer, String, Table

from .base import Base

from ..dictionarization import Dictionarizable


class User(Base, Dictionarizable):

    __tablename__ = 'user'

    _dictionarizable_attrs = ('uid', 'username')

    uid = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    def __repr__(self):
        return '<User %r>' % (self.username)
