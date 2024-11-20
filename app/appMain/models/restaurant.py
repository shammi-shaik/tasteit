# from email.policy import default
from xml.etree.ElementTree import TreeBuilder

from sqlalchemy.orm import foreign

from app.appMain import db
import uuid
from sqlalchemy.dialects.postgresql import UUID
# from werkzeug.security import check_password_hash,generate_password_hash

from app.appMain.models.status import Status


class Restaurant(db.Model):
    __tablename__ = 'restaurant'

    restaurant_id =db.Column(UUID(as_uuid=True),primary_key=True , default=uuid.uuid4())
    restaurant_name =db.Column(db.String(250),nullable=False)
    restaurant_address=db.Column(db.Text,nullable=False)
    status_id = db.Column(UUID(as_uuid=True), db.ForeignKey('status.status_id'), nullable=False)
    restaurant_image_url = db.Column(db.String(500), nullable=True)  # New image URL column
    user_id = db.Column(UUID(as_uuid=True),db.ForeignKey('users.user_id'),nullable=False)

    status = db.relationship('Status', backref=db.backref('restaurant', lazy=True))
    user = db.relationship('Users', backref=db.backref('restaurant', lazy=True))

    def __init__(self, **kwargs):
        super(Restaurant, self).__init__(**kwargs)


