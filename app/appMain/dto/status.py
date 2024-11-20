from flask_restx import Namespace

class StatusDto:
    getstatusapi = Namespace('getstatus', description='api to show status of restaurant')