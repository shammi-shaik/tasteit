from sqlalchemy import false, CheckConstraint

from app.appMain import db
import uuid
from sqlalchemy.dialects.postgresql import UUID

class Dish(db.Model):
    __tablename__ = 'dish'

    dish_id = db.Column(UUID(as_uuid = True),primary_key = True,default = uuid.uuid4())
    restaurant_id = db.Column(UUID(as_uuid=True), db.ForeignKey ('restaurant.restaurant_id'),nullable = False)
    dish_name = db.Column(db.String(250),nullable = False)
    dish_description = db.Column(db.Text , nullable = False)
    dish_price = db.Column(db.Numeric(10,2), nullable = False)
    inventory = db.Column(db.Integer , nullable = False)
    available = db.Column(db.Boolean , nullable = False, default = True)
    dish_image_url = db.Column(db.String(500), nullable=False)
    dish_type = db.Column(db.String(10), nullable=False)

    restaurant = db.relationship('Restaurant', backref=db.backref('dishes', lazy=True))

    def __init__(self , **kwargs):
        super(Dish , self).__init__(**kwargs)

    # Optional: Add check constraints if needed
    __table_args__ = (
        CheckConstraint("type IN ('veg', 'non-veg')", name='check_dish_type'),
        CheckConstraint('dish_price >= 0', name='check_dish_price_positive'),
        CheckConstraint('inventory >= 0', name='check_inventory_positive'),
    )