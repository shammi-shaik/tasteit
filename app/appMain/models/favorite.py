import uuid
from email.policy import default
from app.appMain import db
from sqlalchemy.dialects.postgresql import UUID
from app.appMain.models.restaurant import Restaurant
from app.appMain.models.users import Users

class Favorite(db.Model):
    __tablename__ = 'favorite'

    favorite_id = db.Column(UUID(as_uuid=True),primary_key= True,default=uuid.uuid4())
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey(Users.user_id), nullable=False)
    restaurant_id = db.Column(UUID(as_uuid=True), db.ForeignKey(Restaurant.restaurant_id), nullable=False)

    user = db.relationship('Users', backref=db.backref('favorites', lazy=True))
    restaurant = db.relationship('Restaurant', backref=db.backref('favorites', lazy=True))

    def __init__(self, **kwargs):
        super(Favorite, self).__init__(**kwargs)