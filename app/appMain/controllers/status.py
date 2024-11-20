from crypt import methods
from random import getstate

from app.appMain.models.status import Status
from flask_restx import Resource
from flask import request, jsonify
from app.appMain.dto.status import StatusDto

getstatusapi_blueprint=StatusDto.getstatusapi

@getstatusapi_blueprint.route('',methods=['GET'])
class GetStatus(Resource):
    def get(self):
        status_name= request.args.get('status_name')

        if not status_name:
            return{'message':'the status_id is invalid'}, 400

        status = Status.query.filter_by(status_name=status_name).first()

        if not status:
            return{'message': 'status still pending'},202

        status_data = {
            'status_id': str(status.status_id),
            'status_name': status.status_name,

        }
        return jsonify(status_data)