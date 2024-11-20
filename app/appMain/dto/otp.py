from flask_restx import  Namespace

class OtpDto:
    sendotp_api = Namespace('send-otp', description='API to send to the Email ')
    verifyotp_api = Namespace('verify-otp', description= 'API to verify otp of Email')
    resetpassword_api = Namespace('reset-password', description= 'API to reset_password of Email')