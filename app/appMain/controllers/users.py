from crypt import methods
from datetime import timedelta

from flask_restx import Resource
from flask import request, jsonify
from flask_restx.inputs import email
from flask_jwt_extended import create_access_token,get_jwt_identity,jwt_required
from pycparser.ply.yacc import token
import datetime
import re
from sqlalchemy.sql.functions import current_user
from werkzeug.security import check_password_hash
from app.appMain import db
from app.appMain.models.roles import Roles
from app.appMain.models.users import Users
import uuid
from app.appMain.dto.users import UsersDto


signup_blueprint = UsersDto.signupapi
loginapi_blueprint = UsersDto.loginapi
updatedetailsapi_blueprint = UsersDto.updatedetailsapi
deleteapi_blueprint = UsersDto.deleteapi
getdetailsapi_blueprint = UsersDto.getdetailsapi
listusersapi_blueprint = UsersDto.listusersapi

#signup
@signup_blueprint.route('', methods=['POST'])
class Signup(Resource):
    def post(self):
        data = request.get_json()

        # Check if the user email already exists
        existing_user_email = Users.query.filter_by(email=data['email']).first()
        if existing_user_email:
            return {'message': 'User with this email  already exists'}, 400

        existing_user_phone = Users.query.filter_by(phone_number=data['phone_number']).first()
        if existing_user_phone:
            return {'message': 'User with this phone number already exists'}, 400

        # Fetch the role_name from the request (either 'admin' or 'seller')
        role_name = data.get('role_name', '').lower()  # Get the role_name from the frontend

        # Query the Roles table to get the corresponding role_id
        role = Roles.query.filter_by(role_name=role_name).first()

        if not role:
            return {'message': 'Invalid role provided'}, 400  # Handle if role doesn't exist

        # Create the new user object
        new_user = Users(
            user_id=str(uuid.uuid4()),
            user_name=data['user_name'],
            phone_number=data['phone_number'],
            email=data['email'],
            role_id=role.role_id, # Save the role_id corresponding to the role_name

        )
        new_user.password = data['user_pwd']  # Ideally hash the password before saving

        # Save the new user to the database
        db.session.add(new_user)
        db.session.commit()

        return {'message': 'User created successfully'}, 201

#email_format
def is_email_format(contact):
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_pattern, contact) is not None

# Login route with role distinction and JWT token generation
@loginapi_blueprint.route('', methods=['POST'])
class Login(Resource):
    def post(self):
        try:
            data = request.get_json()
            # Validate input data
            email=data.get('email')
            phone_number=data.get('phone_number')
            password=data.get('user_pwd')
            if not email and not phone_number:
                return {'message': 'Missing contact information (email or phone number)'}, 422
            if not password:
                return {'message': 'Please enter password'}, 422
            if email is not None:
                user=Users.query.filter_by(email=email).first()
            else:
                user = Users.query.filter_by(phone_number=phone_number).first()

            if not user:
                return {'message': 'Email or phone number not registered'}, 404

            # Verify the user's password (assuming the `verify_password` method exists)
            if user and user.verify_password(data['user_pwd']):
                # Create a JWT token for the user
                access_token = create_access_token(identity=user.user_id, expires_delta=timedelta(days=1))
                role = Roles.query.filter_by(role_id=user.role_id).first()

                return {
                        'message': 'user login successful',
                        'role': role.role_name,
                        'access_token': access_token
                    }, 200

            # If credentials don't match, return invalid credentials
            return {'message': 'Invalid credentials'}, 401

        except Exception as e:
            return {
                'message': 'Error processing request',
                'error': str(e)
            }, 500

# update user details
@updatedetailsapi_blueprint.route('', methods=['PUT'])
class UpdateUser(Resource):
    @jwt_required()
    def put(self):
        data = request.get_json()

        try:

            current_user  = get_jwt_identity()
            # Fetch the user by their user_id
            user = Users.query.filter_by(user_id=current_user).first()

            if not user:
                return {'message': 'User not found'}, 404

            # Check if the email is being updated to an existing one
            if 'email' in data and data['email'] != user.email:
                existing_email_user = Users.query.filter_by(email=data['email']).first()
                if existing_email_user:
                    return {'message': 'Email already in use'}, 400

            # Check if the phone number is being updated to an existing one
            if 'phone_number' in data and data['phone_number'] != user.phone_number:
                existing_phone_user = Users.query.filter_by(phone_number=data['phone_number']).first()
                if existing_phone_user:
                    return {'message': 'Phone number already in use'}, 400

            # Update user details
            if 'user_name' in data:
                user.user_name = data['user_name']
            if 'email' in data:
                user.email = data['email']
            if 'role_id' in data:
                user.role_id = data['role_id']
            if 'phone_number' in data:
                user.phone_number = data['phone_number']
            if 'password' in data:
                user.password = data['password']  # Password hashing will be handled by setter

            # Commit the changes to the database
            db.session.commit()

            return {
                'message': 'User updated successfully!',
                'user_id': str(user.user_id)
            }, 200

        except Exception as e:
            # Rollback the session in case of an error
            db.session.rollback()
            return ({
                'message': 'Failed to update user details',
                'error': str(e)
            }), 400




#get user details
@getdetailsapi_blueprint.route('', methods=['GET'])
class GetUser(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()

        # Fetch the user using user_id
        user = Users.query.filter_by(user_id=user_id).first()
        if not user:
            return {'message': 'User not found'}, 404

        # Fetch the role details
        role = Roles.query.filter_by(role_id=user.role_id).first()

        # Prepare the user data response
        user_data = {
            'user_id': str(user.user_id),
            'user_name': user.user_name,
            'email': user.email,
            'phone_number': user.phone_number,
            'role_name': role.role_name if role else None
        }
        return jsonify(user_data)

# Delete user
@deleteapi_blueprint.route('', methods=['DELETE'])
class DeleteUser(Resource):
    @jwt_required()  # Ensure that the request is authenticated
    def delete(self):
        data = request.get_json()

        # Check if email or phone_number is provided in the request
        if not data.get('email') and not data.get('phone_number'):
            return {'message': 'User email or phone number is required'}, 400

        # Find the user by email or phone_number
        user = None
        if data.get('email'):
            user = Users.query.filter_by(email=data['email']).first()
        elif data.get('phone_number'):
            user = Users.query.filter_by(phone_number=data['phone_number']).first()

        if user:
            db.session.delete(user)
            db.session.commit()
            return {'message': 'User deleted successfully'}, 200
        else:
            return {'message': 'User not found'}, 404


# List of users
@listusersapi_blueprint.route('', methods=['GET'])
class Listusers(Resource):
    @jwt_required()  # Ensure that the request is authenticated
    def get(self):
        try:
            # Fetch all users from the database
            users = Users.query.all()

            if not users:
                return {'message': 'No users found'}, 404

            # Create a list of user details
            users_list = [{
                'user_id': str(user.user_id),
                'user_name': user.user_name,
                'email': user.email,
                'phone_number': user.phone_number,
                'role_id': str(user.role_id),      # Include role ID
                'role_name': Roles.query.filter_by(role_id=user.role_id).first().role_name if user.role_id else None  # Include role name
            } for user in users]

            # Return the list of users
            return {'users': users_list}, 200

        except Exception as e:
            # Handle any unexpected errors
            return {'message': 'Failed to retrieve users', 'error': str(e)}, 500
