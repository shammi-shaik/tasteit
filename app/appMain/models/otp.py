import uuid
from app.appMain import db
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime

class Otp(db.Model):
    __tablename__ = 'otp'

    otp_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    otp = db.Column(db.String(6), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    expires_at = db.Column(db.TIMESTAMP, nullable=False)

    def __init__(self, **kwargs):
        super(Otp, self).__init__(**kwargs)
