from flask_restx import Namespace

class RolesDto:
    getroleapi = Namespace('getrole', description='api to show role of user')