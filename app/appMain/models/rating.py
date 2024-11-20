import uuid
from email.policy import default
from enum import unique

from app.appMain import db
from sqlalchemy.dialects.postgresql import UUID

from app.appMain.models.orders import Orders
from app.appMain.models.restaurant import Restaurant
from app.appMain.models.users import Users



class Rating(db.Model):
    __tablename__ ='rating'

    rating_id = db.Column(UUID(as_uuid= True) , primary_key =True, default= uuid.uuid4())
    rating_value = db.Column(db.Integer , default = 0)
    user_id = db.Column (UUID(as_uuid=True) ,db.ForeignKey(Users.user_id) , nullable = False)
    order_id = db.Column(UUID(as_uuid=True), db.ForeignKey(Orders.order_id), nullable=False,unique =True)
    restaurant_id = db.Column(UUID(as_uuid=True), db.ForeignKey('restaurant.restaurant_id'), nullable=False)

    restaurant = db.relationship('Restaurant', backref=db.backref('ratings', lazy=True))
    user = db.relationship('Users', backref=db.backref('ratings', lazy=True))
    order = db.relationship('Orders', backref=db.backref('rating', lazy=True))

    def __init__(self , **kwargs):
        super(Rating,self).__init__(**kwargs)