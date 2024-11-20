import nullable
from flask_restx.fields import Integer
from sqlalchemy import Nullable

from app.appMain import db
import uuid
from sqlalchemy.dialects.postgresql import UUID
from werkzeug.security import generate_password_hash,check_password_hash


class Users(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    user_pwd = db.Column(db.String(100), nullable=False)
    role_id = db.Column (db.Integer, db.ForeignKey('roles.role_id'),nullable=False)
    phone_number = db.Column(db.String(15), nullable=False, unique=True)


    def __init__(self, **kwargs):
        super(Users,self).__init__(**kwargs)
    
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')
    
    @password.setter
    def password(self,password):
        self.user_pwd = generate_password_hash(password,salt_length=10)
    
    def verify_password(self,password):
        return check_password_hash(self.user_pwd,password)