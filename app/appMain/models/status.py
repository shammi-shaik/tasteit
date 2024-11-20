from app.appMain import db
import uuid
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from werkzeug.security import generate_password_hash,check_password_hash

class Status(db.Model):
    __tablename__='status'

    status_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status_name=db.Column(db.String(75),nullable=False)


    def __init__(self, **kwargs):
        super(Status, self).__init__(**kwargs)
