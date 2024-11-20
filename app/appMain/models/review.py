from email.policy import default

from sqlalchemy.testing.pickleable import Order

from app.appMain import db
import  uuid
from sqlalchemy.dialects.postgresql import  UUID
from app.appMain.models import users ,restaurant
from app.appMain.models.orders import Orders
from app.appMain.models.restaurant import Restaurant
from app.appMain.models.users import Users


class Review(db.Model):
    __tablename__ = 'review'

    review_id = db.Column(UUID(as_uuid=True) , primary_key = True , default = uuid.uuid4)
    review_description = db.Column(db.Text )
    user_id = db.Column (UUID(as_uuid= True) ,db.ForeignKey(Users.user_id) , nullable = False)
    order_id = db.Column (UUID(as_uuid= True) , db.ForeignKey(Orders.order_id) , nullable = False,unique =True)
    likes = db.Column (db.Integer ,default = 0)
    restaurant_id = db.Column(UUID(as_uuid=True), db.ForeignKey('restaurant.restaurant_id'), nullable=False)

    restaurant = db.relationship('Restaurant', backref=db.backref('reviews', lazy=True))
    user = db.relationship('Users', backref=db.backref('reviews', lazy=True))
    order = db.relationship('Orders', backref=db.backref('review', lazy=True))

    def __init__(self , **kwargs):
        super(Review, self).__init__(**kwargs)