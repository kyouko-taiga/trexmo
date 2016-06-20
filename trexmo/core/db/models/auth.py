import uuid

from flask import current_app

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Table
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship

from trexmo.core.utils.time import utcnow

from .base import Base

from ..column_types import UtcDateTime


class User(Base):

    __tablename__ = 'user'

    uid = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    display_name = Column(String, default=lambda ctx: ctx.current_parameters['username'])

    tokens = relationship('Token', backref='owner', passive_deletes=True)

    def __repr__(self):
        return '<User %r>' % (self.username)


class Token(Base):

    __tablename__ = 'token'

    value = Column(String, primary_key=True, nullable=False)
    expires_at = Column(UtcDateTime, default=utcnow)

    user_uid = Column(Integer, ForeignKey('user.uid', ondelete='CASCADE'))

    @hybrid_property
    def has_expired(self):
        return utcnow() > self.expires_at

    def __repr__(self):
        return '<Token %r>' % (self.owner)
