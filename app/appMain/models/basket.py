from email.policy import default
from flask_restx.fields import Integer
from sqlalchemy import ForeignKey
import uuid
from app.appMain import db
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import CheckConstraint


class Basket(db.Model):
    __tablename__ = 'basket'

    basket_id = db.Column(UUID(as_uuid = True), primary_key=True,default = uuid.uuid4 )
    user_id =db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False)
    dish_id = db.Column(UUID(as_uuid=True), db.ForeignKey('dish.dish_id') ,nullable = False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    price = db.Column(db.Float,nullable = False , default= 0.00)

    user = db.relationship('Users', backref=db.backref('baskets', lazy=True))
    dish = db.relationship('Dish', backref=db.backref('baskets', lazy=True))


    __table_args__ = (
        CheckConstraint('quantity > 0', name='check_quantity_positive'),
    )

    def __init__(self, **kwargs):
        super(Basket, self).__init__(**kwargs)