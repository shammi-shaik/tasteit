from datetime import datetime
from email.policy import default
from unicodedata import numeric
from app.appMain import db
import uuid
from sqlalchemy.dialects.postgresql import UUID
from app.appMain.models.users import Users


class Orders(db.Model):
    __tablename__ = 'orders'

    order_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey(Users.user_id), nullable=False)
    # dish_id = db.Column(UUID(as_uuid=True), db.ForeignKey('dish.dish_id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    total_price = db.Column(db.Float, default=0.00)
    order_time = db.Column(db.DateTime, default=db.func.now(), nullable=False)  # Added time column

    user = db.relationship('Users', backref=db.backref('orders', lazy=True))
    # dish = db.relationship('Dish', backref=db.backref('orders', lazy=True))

    def __init__(self, **kwargs):
        super(Orders, self).__init__(**kwargs)

    def to_dict(self):
        """Converts the order instance to a dictionary."""
        return {
            'order_id': str(self.order_id),
            'user_id': str(self.user_id),
            'quantity': self.quantity,
            'total_price': self.total_price,
            'order_time': self.order_time.isoformat() if self.order_time else None,
            'user': {
                'user_id': str(self.user.user_id),
                'user_name': self.user.user_name
            } if self.user else None
            # Add dish details if needed
        }
