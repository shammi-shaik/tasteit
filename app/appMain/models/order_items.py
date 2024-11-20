from datetime import datetime
from email.policy import default
from unicodedata import numeric
from app.appMain import db
import uuid
from sqlalchemy.dialects.postgresql import UUID

from app.appMain.models.orders import Orders
from app.appMain.models.users import Users


class OrderItems(db.Model):
    __tablename__ = 'order_items'

    order_item_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    order_id = db.Column(UUID(as_uuid=True), db.ForeignKey(Orders.order_id), nullable=False)
    dish_id = db.Column(UUID(as_uuid=True), db.ForeignKey('dish.dish_id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    total_price = db.Column(db.Float, default=0.00)
    order_time =db.Column(db.DateTime, default=db.func.now(), nullable=False)  # Added time column

    order = db.relationship('Orders', backref=db.backref('order_items', lazy=True))
    dish = db.relationship('Dish', backref=db.backref('orders', lazy=True))

    def __init__(self, **kwargs):
        super(OrderItems, self).__init__(**kwargs)

    def to_dict(self):
        return {
            "order_item_id": str(self.order_item_id),
            "order_id": str(self.order_id),
            "dish_id": str(self.dish_id),
            "dish_name":self.dish.dish_name,
            "dish_image_url":self.dish.dish_image_url,
            "quantity": self.quantity,
            "total_price": self.total_price,
            "order_time": self.order_time.isoformat() if self.order_time else None
            # 'user': {
            #     'user_id': str(self.user.user_id),
            #     'user_name': self.user.user_name
            # } if self.user else None

        }