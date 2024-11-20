from app.appMain import db
from sqlalchemy.orm import relationship


class Roles(db.Model):
    __tablename__ = 'roles'

    role_id = db.Column(db.Integer, primary_key=True)
    role_name = db.Column(db.String(100), nullable=False, unique=True)

    users = relationship('Users', backref='roles')

    def __init__(self, **kwargs):
        super(Roles, self).__init__(**kwargs)