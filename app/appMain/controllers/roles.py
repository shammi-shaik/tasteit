from flask_restx import Resource
from flask import request, jsonify
from app.appMain import db
from app.appMain.models.roles import Roles
import uuid
from app.appMain.dto.roles import RolesDto

getroleapi_blueprint = RolesDto.getroleapi


# get role details
@getroleapi_blueprint.route('', methods=['GET'])
class GetRole(Resource):
    def get(self):
        role_id = request.args.get('role_id')

        if not role_id:
            return {'message': 'the role_id is invalid'}, 400

        role = Roles.query.filter_by(role_id=role_id).first()

        if not role:
            return {'message': 'role not found'}, 404

        role_data = {
            'role_id': str(role.role_id),
            'role_name': role.role_name,

        }
        return (role_data)