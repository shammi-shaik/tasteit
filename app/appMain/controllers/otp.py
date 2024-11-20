from datetime import datetime, timedelta
import re
import smtplib
import uuid
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from flask_restx import Resource
from flask import request
from werkzeug.security import check_password_hash, generate_password_hash
from app.appMain import db
from app.appMain.dto.otp import OtpDto
from app.appMain.dto.rating import RatingDto
from app.appMain.models.otp import Otp
from app.appMain.models.users import Users


sendotp_blueprint = OtpDto.sendotp_api
veirfyotp_blueprint = OtpDto.verifyotp_api
reset_password_blueprint = OtpDto.resetpassword_api

email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

def generate_otp():
    return str(uuid.uuid4().int)[:6]  #


#send otp
@sendotp_blueprint.route('', methods=['POST'])
class SentOpt(Resource):
    def post(self):
        data = request.json
        email = data.get('email')  # Get the email from the request

        if not email:
            return {"message": "please enter the email before submitting"}, 400
        if not re.match(email_regex, email):
            return {"message": "Invalid email"}, 400
        user = Users.query.filter_by(email=email).first()

        if not user:
            return {"message": "email not registered"}, 404

        otp_code = generate_otp()
        expires_at = datetime.now() + timedelta(minutes=5)  # OTP expires in 5 minutes

        # Check if OTP already exists for this email and delete if found
        otp_entry = Otp.query.filter_by(email=email).first()
        if otp_entry:
            db.session.delete(otp_entry)
            db.session.commit()

        # Create and save new OTP entry
        new_otp = Otp(email=email, otp=otp_code, expires_at=expires_at)
        db.session.add(new_otp)
        db.session.commit()

        # Send the OTP via email
        if self.send_email(email, otp_code):
            return {"message": "OTP sent successfully"}, 200
        else:
            return {"message": "email not registered"}, 500

    def send_email(self, email, otp_code):

        # print(recipient_email)
        # Set up the server and sender information
        sender_email = "lsoneproject@gmail.com"
        app_password = "kpme ktaz mdhk nhyi"  # Use an app password if using Gmail

        # Create the email content
        subject = "Your OTP Code for Password Reset"
        body = f" Your OTP code is: {otp_code}\nIt is valid for 5 minutes."

        # Create the email message
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(sender_email, app_password)
                server.send_message(msg)
                return "Email sent successfully!"
        except Exception as e:
            raise Exception("Invaild Email")


#verify otp
@veirfyotp_blueprint.route('', methods=['POST'])
class VerifyOtp(Resource):
    def post(self):
        data = request.json
        email = data.get('email')
        otp_code = data.get('otp')

        if not email or not otp_code:
            return {"message": "Email and OTP are required"}, 400

        otp_entry = Otp.query.filter_by(email=email, otp=otp_code).first()
        print(otp_entry)

        if not otp_entry:
            return {"message": "Invalid OTP or email"}, 400

        if otp_entry.expires_at < datetime.now():
            db.session.delete(otp_entry)
            db.session.commit()
            return {"message": "OTP has expired"}, 400

        # If everything is valid, OTP is verified successfully
        # Optional: delete the OTP after successful verification
        db.session.delete(otp_entry)
        db.session.commit()

        return {"message": "OTP verified successfully"}, 200


#reset password
@reset_password_blueprint.route('', methods=['POST'])
class ResetPassword(Resource):
    def post(self):

        data = request.json
        email = data.get('email')
        new_password = data.get('new_password')
        print(new_password)

        # Ensure that new_password is provided
        if not new_password:
            return {"message": "enter the passwords before submitting"}, 400

        # Retrieve the user
        user = Users.query.filter_by(email=email).first()
        print(22)

        if user is None:
            return {"message": "User not found"}, 404

        if check_password_hash(user.user_pwd, new_password):
            print(66666)
            return {"message": "Your new password must be different from the old password"}, 400

        # Hash and update the password
        print(55)
        user.user_pwd = generate_password_hash(new_password)

        db.session.commit()
        print('66')

        return {"message": "Password reset successfully"}, 200
